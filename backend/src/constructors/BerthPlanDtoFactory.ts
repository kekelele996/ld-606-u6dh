import type { BerthPlan, PlanTransition } from "../models/BerthPlan";
import type { YardSlot } from "../models/YardSlot";
import type { WorkTask } from "../models/WorkTask";

export const createBerthPlanDto = (overrides = {}) => ({
  id: 1,
  vessel_id: 1,
  berth_id: 1,
  planned_arrival: "planned arrival 1",
  planned_departure: "planned departure 1",
  priority: "priority 1",
  status: "CONFLICT",
  dispatcher_id: 1,
  yard_slot_ids: [],
  task_type: "DISCHARGE",
  reject_reason: null,
  transitions: [],
  version: 0,
  ...overrides
});

export interface BerthPlanDetailDto {
  id: number;
  vessel_id: number;
  berth_id: number;
  planned_arrival: string;
  planned_departure: string;
  priority: string;
  status: string;
  dispatcher_id: number;
  task_type: string;
  version: number;
  reject_reason: string | null;
  /** Latest flow result, surfaced at the top of the detail page. */
  latestTransition: PlanTransition | null;
  transitions: PlanTransition[];
  slots: YardSlot[];
  tasks: WorkTask[];
}

export const createBerthPlanDetailDto = (
  plan: BerthPlan,
  slots: YardSlot[],
  tasks: WorkTask[]
): BerthPlanDetailDto => ({
  id: plan.id,
  vessel_id: plan.vessel_id,
  berth_id: plan.berth_id,
  planned_arrival: plan.planned_arrival,
  planned_departure: plan.planned_departure,
  priority: plan.priority,
  status: plan.status,
  dispatcher_id: plan.dispatcher_id,
  task_type: plan.task_type,
  version: plan.version,
  reject_reason: plan.reject_reason,
  latestTransition: plan.transitions.length ? plan.transitions[plan.transitions.length - 1] : null,
  transitions: plan.transitions,
  slots,
  tasks
});
