export interface PlanTransition {
  at: string;
  dispatcher_id: number;
  action: "SUBMIT_APPROVE" | "APPROVED" | "REJECTED";
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
  /** Yard slots that the plan requests to hold once approved. */
  yard_slot_ids: number[];
  /** LOAD / DISCHARGE task kind opened for every held slot on approval. */
  task_type: string;
  /** Latest reject reason, cleared on successful approval. */
  reject_reason: string | null;
  /** Full approval flow history (latest last). */
  transitions: PlanTransition[];
  /** Optimistic-lock version, bumped on every write. */
  version: number;
}
