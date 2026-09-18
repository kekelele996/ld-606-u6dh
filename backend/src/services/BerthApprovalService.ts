import { db, type DatabaseShape } from "../config/inMemoryDb";
import { berthPlanRepository } from "../repositories/BerthPlanRepository";
import { yardSlotRepository } from "../repositories/YardSlotRepository";
import { workTaskRepository } from "../repositories/WorkTaskRepository";
import { approvalFlowRepository } from "../repositories/ApprovalFlowRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { APPROVE_ROLES, type Role } from "../constants/roles";
import { WorkTaskType } from "../constants/WorkTaskType";
import { BusinessError } from "../utils/BusinessError";
import { fillTemplate } from "../utils/formatters";
import { withApprovalLock } from "../utils/approvalLock";
import { createWorkTaskDto } from "../constructors/WorkTaskDtoFactory";
import { createApprovalFlowDto } from "../constructors/ApprovalFlowDtoFactory";
import type { ApproveBerthPlanPayload, ApproveTaskPayload } from "../types/BerthPlanPayload";
import type { BerthPlan } from "../models/BerthPlan";
import type { ApprovalFlow } from "../models/ApprovalFlow";

export interface ApproveResult {
  plan: BerthPlan;
  flow: ApprovalFlow;
  occupied_slot_ids: number[];
  tasks: { id: number; yard_slot_id: number; task_type: string }[];
}

const APPROVABLE_STATUS = ["DRAFT", "CONFLICT"];

const fail = (
  code: keyof typeof ERROR_CODES,
  params: Record<string, string | number> = {},
  status = 409
): never => {
  throw new BusinessError(ERROR_CODES[code], fillTemplate(ERROR_MESSAGES[code], params), status);
};

const logLine = (template: string, params: Record<string, string | number>) =>
  console.info(fillTemplate(template, params));

/**
 * 靠泊计划审批领域服务。
 * 核心约束：审批状态、箱位占用、任务创建必须「一次保存」——
 * 三者在同一个 db.runTransaction 快照内完成，任一步抛错整体回滚。
 */
export const berthApprovalService = {
  /**
   * 审批靠泊计划。
   * withApprovalLock：两名调度员同时审批时临界区串行，只可能有一份成功。
   * 业务三项（审批状态 / 箱位占用 / 任务）在同一个 runTransaction 内一次保存；
   * 失败时另起一个只写流转记录的事务留痕，业务三项保持原样。
   */
  approve(
    planId: number,
    payload: ApproveBerthPlanPayload,
    actor: { id: number; role: Role }
  ): Promise<ApproveResult> {
    return withApprovalLock(() => {
      try {
        return db.runTransaction((tables) => this.applyApproval(tables, planId, payload, actor));
      } catch (error) {
        const code = error instanceof BusinessError ? error.code : "INTERNAL_ERROR";
        const reason = error instanceof BusinessError ? error.message : String(error ?? "审批失败");
        // 失败留痕：独立事务仅追加 REJECTED 流转记录，绝不改计划/箱位/任务。
        db.runTransaction((tables) =>
          this.recordRejection(tables, planId, code, reason, actor.id)
        );
        throw error;
      }
    });
  },

  /** 事务体：所有校验 + 三项写入，抛错即由 runTransaction 整体回滚。 */
  applyApproval(
    tables: DatabaseShape,
    planId: number,
    payload: ApproveBerthPlanPayload,
    actor: { id: number; role: Role }
  ): ApproveResult {
    // 0. 调度权限不足：整次拒绝
    if (!APPROVE_ROLES.includes(actor.role)) {
      fail("RBAC_DENIED", {}, 403);
    }

    // 1. 解析指定箱位
    const slotIds = (payload.yard_slot_ids ?? payload.slots ?? []).map(Number).filter(Number.isFinite);
    if (slotIds.length === 0) {
      throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }
    const uniqueSlotIds = [...new Set(slotIds)];

    // 2. 计划必须存在
    const plan = berthPlanRepository.findById(planId, tables);
    if (!plan) {
      fail("BERTH_PLAN_NOT_FOUND", { plan: planId }, 404);
    }

    // 3. 箱位释放前只能挂一份已审批计划：状态必须可审批
    //    并发场景下，后进入临界区的调度员会在这里读到对手刚提交的 APPROVED，从而失败。
    if (plan!.status === "APPROVED" || plan!.status === "BERTHING") {
      fail("BERTH_PLAN_ALREADY_APPROVED", { plan: planId });
    }
    if (!APPROVABLE_STATUS.includes(plan!.status)) {
      fail("BERTH_PLAN_NOT_APPROVABLE", { plan: planId, status: plan!.status }, 422);
    }

    // 4. 泊位时段重叠检测（只与已审批/靠泊中计划比较，半开区间）
    const overlap = tables.berthPlan.find(
      (other) =>
        other.id !== planId &&
        other.berth_id === plan!.berth_id &&
        ["APPROVED", "BERTHING"].includes(other.status) &&
        plan!.planned_arrival < other.planned_departure &&
        other.planned_arrival < plan!.planned_departure
    );
    if (overlap) {
      fail("BERTH_TIME_OVERLAP", {
        berth: plan!.berth_id,
        arrival: plan!.planned_arrival,
        departure: plan!.planned_departure,
        plan: overlap.id
      });
    }

    // 5. 箱位必须存在且未被占用
    for (const slotId of uniqueSlotIds) {
      const slot = yardSlotRepository.findById(slotId, tables);
      if (!slot) {
        fail("YARD_SLOT_NOT_FOUND", { slot: slotId }, 404);
      }
      const occupier = yardSlotRepository.findOccupyingPlan(slotId, plan!, tables);
      if (occupier) {
        fail("YARD_SLOT_OCCUPIED", { slot: slotId, plan: occupier.id });
      }
      if (["RESERVED", "OCCUPIED", "LOCKED"].includes(slot!.slot_status)) {
        // 已被人工锁定/占用但查不到占用计划：同样拒绝
        fail("YARD_SLOT_LOCKED", { slot: slotId, status: slot!.slot_status });
      }
    }

    // 6. 一次保存：① 计划状态 -> APPROVED ② 占用箱位 ③ 开出装卸任务
    const dispatcherId = actor.id || Number(payload.dispatcher_id) || plan!.dispatcher_id;
    plan!.status = "APPROVED";
    plan!.dispatcher_id = dispatcherId;

    const taskSpecs: Record<number, ApproveTaskPayload> = {};
    for (const task of payload.tasks ?? []) {
      taskSpecs[Number(task.yard_slot_id)] = task;
    }

    const createdTasks: ApproveResult["tasks"] = [];
    let nextTaskId = workTaskRepository.nextId(tables);
    for (const slotId of uniqueSlotIds) {
      const slot = yardSlotRepository.findById(slotId, tables)!;
      slot.slot_status = "OCCUPIED"; // ② 占用指定箱位

      const spec = taskSpecs[slotId];
      const taskType = spec?.task_type ?? "DISCHARGE";
      if (!WorkTaskType.includes(taskType as (typeof WorkTaskType)[number])) {
        throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED, 400);
      }

      const taskId = nextTaskId;
      nextTaskId += 1;
      const task = createWorkTaskDto({
        id: taskId,
        berth_plan_id: planId,
        yard_slot_id: slotId,
        task_type: taskType,
        team_id: spec?.team_id ?? payload.team_id ?? 101,
        status: "PENDING",
        planned_start: spec?.planned_start ?? plan!.planned_arrival,
        finished_at: ""
      });
      workTaskRepository.insert(task, tables); // ③ 开出装卸任务
      createdTasks.push({ id: taskId, yard_slot_id: slotId, task_type: taskType });

      logLine(LOG_TEMPLATES.YardSlot[4], { slot: slotId, plan: planId });
      logLine(LOG_TEMPLATES.WorkTask[4], { task: taskId, plan: planId, slot: slotId });
    }

    // 7. 流转结果（成功）与三项变更在同一事务提交
    const flow = createApprovalFlowDto({
      id: approvalFlowRepository.nextId(tables),
      berth_plan_id: planId,
      result: "APPROVED",
      reason: "",
      dispatcher_id: dispatcherId,
      occupied_slot_ids: uniqueSlotIds.join(","),
      created_task_ids: createdTasks.map((task) => task.id).join(","),
      created_at: new Date().toISOString()
    });
    approvalFlowRepository.append(flow, tables);

    logLine(LOG_TEMPLATES.BerthPlan[4], {
      plan: planId,
      slots: uniqueSlotIds.join(","),
      tasks: createdTasks.map((task) => task.id).join(","),
      dispatcher: dispatcherId
    });

    return { plan: plan!, flow, occupied_slot_ids: uniqueSlotIds, tasks: createdTasks };
  },

  /** 审批被拒绝后也要留痕（详情页要能看到最新失败原因）；记录本身不改业务三项。 */
  recordRejection(
    tables: DatabaseShape,
    planId: number,
    code: string,
    reason: string,
    dispatcherId: number
  ): ApprovalFlow {
    const flow = createApprovalFlowDto({
      id: approvalFlowRepository.nextId(tables),
      berth_plan_id: planId,
      result: "REJECTED",
      reason,
      dispatcher_id: dispatcherId,
      created_at: new Date().toISOString()
    });
    approvalFlowRepository.append(flow, tables);
    logLine(LOG_TEMPLATES.BerthPlan[5], {
      plan: planId,
      code,
      reason,
      dispatcher: dispatcherId
    });
    return flow;
  },

  /** 详情页数据：计划 + 最新流转结果（含失败原因）。 */
  getDetail(planId: number) {
    const tables = db.getTables();
    const plan = berthPlanRepository.findById(planId, tables);
    return {
      plan,
      latestFlow: plan ? approvalFlowRepository.latestOfPlan(planId, tables) : undefined,
      flows: plan ? approvalFlowRepository.findByPlan(planId, tables) : [],
      tasks: plan ? workTaskRepository.findByPlan(planId, tables) : []
    };
  }
};
