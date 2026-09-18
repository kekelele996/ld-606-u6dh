import type { YardSlot } from "./YardSlot";
import type { WorkTask } from "./WorkTask";

export type PlanTransitionAction = "SUBMIT_APPROVE" | "APPROVED" | "REJECTED";

export interface PlanTransition {
  at: string;
  dispatcher_id: number;
  action: PlanTransitionAction;
  code?: string;
  reason?: string;
}

export interface BerthPlan {
  id: number;
  vessel_id: number;
  berth_id: number;
  planned_arrival: string;
  planned_departure: string;
  priority: string;
  status: string;
  dispatcher_id: number;
  yard_slot_ids: number[];
  task_type: string;
  reject_reason: string | null;
  transitions: PlanTransition[];
  version: number;
}

export interface BerthPlanDetail extends BerthPlan {
  latestTransition: PlanTransition | null;
  slots: YardSlot[];
  tasks: WorkTask[];
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
