import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES, fillMessage } from "../constants/errorMessages";
import { LOG_TEMPLATES, renderLog } from "../constants/logTemplates";
import { BerthPlanStatus } from "../constants/BerthPlanStatus";
import { WorkTaskStatus } from "../constants/WorkTaskStatus";
import { DomainError } from "../utils/DomainError";
import { withTransaction, type DbTables } from "../repositories/db";
import { berthPlanRepository } from "../repositories/BerthPlanRepository";
import { workTaskRepository } from "../repositories/WorkTaskRepository";
import { auditLogRepository } from "../repositories/AuditLogRepository";
import { checkBerthTimeConflict } from "./berthConflictService";
import { allocateYardSlots } from "./yardAllocationService";
import type { PlanTransition } from "../models/BerthPlan";

export interface ApprovePlanCommand {
  planId: number;
  dispatcherId: number;
  expectedVersion?: number;
  /** Override the planned slots at approval time (defaults to plan.yard_slot_ids). */
  slotIds?: number[];
}

export interface ApprovePlanResult {
  ok: boolean;
  planId: number;
  status: string;
  version: number;
  reason: string | null;
  code?: string;
  slotIds: number[];
  taskIds: number[];
}

const APPROVABLE_STATUSES = new Set(["DRAFT", "CONFLICT"]);
const nowIso = () => new Date().toISOString();

/**
 * Stage plan status flip + slot occupation + work task creation on one
 * transaction snapshot. Any thrown DomainError aborts the transaction and
 * withTransaction discards the snapshot — all three effects stay untouched.
 */
const stageApproval = (tables: DbTables, command: ApprovePlanCommand): ApprovePlanResult => {
  const plan = berthPlanRepository.findById(tables, command.planId);
  if (!plan) {
    throw new DomainError(
      ERROR_CODES.BERTH_PLAN_NOT_FOUND,
      fillMessage(ERROR_MESSAGES.BERTH_PLAN_NOT_FOUND, { id: command.planId }),
      { id: command.planId },
      404
    );
  }

  // Optimistic-lock check: the other dispatcher who approves first bumps
  // version, so the stale request fails here instead of double-approving.
  if (command.expectedVersion !== undefined && command.expectedVersion !== plan.version) {
    throw new DomainError(
      ERROR_CODES.APPROVE_CONCURRENT_CONFLICT,
      fillMessage(ERROR_MESSAGES.APPROVE_CONCURRENT_CONFLICT, { id: plan.id }),
      { id: plan.id }
    );
  }

  // Idempotency guard against concurrent approval after version re-checks.
  if (!APPROVABLE_STATUSES.has(plan.status)) {
    throw new DomainError(
      ERROR_CODES.BERTH_PLAN_NOT_APPROVABLE,
      fillMessage(ERROR_MESSAGES.BERTH_PLAN_NOT_APPROVABLE, { id: plan.id, status: plan.status }),
      { id: plan.id, status: plan.status }
    );
  }

  const slotIds = command.slotIds ?? plan.yard_slot_ids;

  // Rule 1: berth time window must not overlap another approved plan.
  const overlap = checkBerthTimeConflict(
    {
      berth_id: plan.berth_id,
      planned_arrival: plan.planned_arrival,
      planned_departure: plan.planned_departure
    },
    berthPlanRepository.findApprovedOnBerth(tables, plan.berth_id, plan.id)
  );
  if (overlap.conflict) {
    throw new DomainError(
      ERROR_CODES.BERTH_TIME_OVERLAP,
      fillMessage(ERROR_MESSAGES.BERTH_TIME_OVERLAP, {
        berthId: plan.berth_id,
        planId: overlap.overlapPlanId ?? -1
      }),
      { berthId: plan.berth_id, planId: overlap.overlapPlanId as number }
    );
  }

  // Rule 2: every designated slot must be unreleased/unlocked.
  const { slots } = allocateYardSlots(tables, slotIds);

  // All preconditions passed — stage the three effects together.
  plan.status = BerthPlanStatus[2] satisfies (typeof BerthPlanStatus)[number]; // APPROVED
  plan.dispatcher_id = command.dispatcherId;
  plan.reject_reason = null;
  plan.yard_slot_ids = slots.map((slot) => slot.id);
  plan.version += 1;

  const transition: PlanTransition = {
    at: nowIso(),
    dispatcher_id: command.dispatcherId,
    action: "APPROVED"
  };
  plan.transitions.push(transition);

  const taskIds: number[] = [];
  slots.forEach((slot) => {
    // Occupy the slot and bind it to this plan until release.
    slot.slot_status = "OCCUPIED";
    slot.held_by_plan_id = plan.id;
    slot.version += 1;

    // Open one loading/discharge task per held slot.
    const taskId = workTaskRepository.nextId(tables);
    workTaskRepository.insert(tables, {
      id: taskId,
      berth_plan_id: plan.id,
      yard_slot_id: slot.id,
      task_type: plan.task_type,
      team_id: null,
      status: WorkTaskStatus[0], // PENDING
      planned_start: plan.planned_arrival,
      finished_at: null
    });
    taskIds.push(taskId);
  });

  auditLogRepository.insert(tables, {
    actor: `dispatcher:${command.dispatcherId}`,
    action: renderLog(LOG_TEMPLATES.BerthPlan[5], {
      planId: plan.id,
      slotIds: slotIds.join(","),
      taskIds: taskIds.join(",")
    }),
    target_type: "BerthPlan",
    target_id: String(plan.id)
  });

  return {
    ok: true,
    planId: plan.id,
    status: plan.status,
    version: plan.version,
    reason: null,
    slotIds: slots.map((slot) => slot.id),
    taskIds
  };
};

/**
 * Record a failed approval onto the plan itself. This is a separate write
 * from the guarded transaction: failure must leave status/slots/tasks as
 * they were, but the detail page still needs the latest flow result + reason.
 */
const recordRejection = async (
  command: ApprovePlanCommand,
  code: string,
  reason: string
): Promise<ApprovePlanResult> =>
  withTransaction((tables) => {
    const plan = berthPlanRepository.findById(tables, command.planId);
    if (plan) {
      plan.reject_reason = reason;
      plan.version += 1;
      const transition: PlanTransition = {
        at: nowIso(),
        dispatcher_id: command.dispatcherId,
        action: "REJECTED",
        code,
        reason
      };
      plan.transitions.push(transition);
      auditLogRepository.insert(tables, {
        actor: `dispatcher:${command.dispatcherId}`,
        action: renderLog(LOG_TEMPLATES.BerthPlan[7], {
          planId: plan.id,
          code,
          dispatcherId: command.dispatcherId
        }),
        target_type: "BerthPlan",
        target_id: String(plan.id)
      });
    }
    return {
      ok: false,
      planId: command.planId,
      status: plan?.status ?? "UNKNOWN",
      version: plan?.version ?? 0,
      reason,
      code,
      slotIds: plan?.yard_slot_ids ?? [],
      taskIds: []
    };
  });

export const approvePlanService = {
  /**
   * Single approval entry point. Serialised by the writer mutex; the three
   * guarded resources commit in one transaction or are all left untouched.
   */
  approve: async (command: ApprovePlanCommand): Promise<ApprovePlanResult> => {
    try {
      return await withTransaction((tables) => stageApproval(tables, command));
    } catch (error) {
      if (error instanceof DomainError) {
        return await recordRejection(command, error.code, error.message);
      }
      throw error;
    }
  }
};
