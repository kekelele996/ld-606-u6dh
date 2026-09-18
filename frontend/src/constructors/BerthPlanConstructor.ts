import type { ApprovePlanResult, BerthPlan, BerthPlanDetail, PlanTransition } from "../types/BerthPlan";

export const createDefaultBerthPlan = (overrides: Partial<BerthPlan> = {}): BerthPlan => ({
  id: 1,
  vessel_id: 1,
  berth_id: 1,
  planned_arrival: "",
  planned_departure: "",
  priority: "NORMAL",
  status: "DRAFT",
  dispatcher_id: 0,
  yard_slot_ids: [],
  task_type: "DISCHARGE",
  reject_reason: null,
  transitions: [],
  version: 0,
  ...overrides
});

export const createBerthPlanForm = createDefaultBerthPlan;
export const createBerthPlanResponse = createDefaultBerthPlan;

/** Build the empty approval-result card shown before any attempt. */
export const createEmptyApproveResult = (planId: number): ApprovePlanResult => ({
  ok: false,
  planId,
  status: "",
  version: 0,
  reason: null,
  slotIds: [],
  taskIds: []
});

/** Latest flow result line rendered at the top of the detail page. */
export const createTransitionView = (transition: PlanTransition | null) =>
  transition
    ? {
        at: transition.at,
        action: transition.action,
        dispatcherId: transition.dispatcher_id,
        code: transition.code ?? "",
        reason: transition.reason ?? ""
      }
    : null;

export type { BerthPlanDetail };
