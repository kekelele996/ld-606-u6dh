import type { BerthPlan } from "./BerthPlan";
import type { WorkTask } from "./WorkTask";
import type { ApprovalFlow } from "./ApprovalFlow";

/** GET /api/berth-plan/:id 详情聚合。 */
export interface BerthPlanDetail {
  plan: BerthPlan;
  latestFlow?: ApprovalFlow;
  flows: ApprovalFlow[];
  tasks: WorkTask[];
}

/** POST /api/berth-plan/:id/approve 请求体。 */
export interface ApproveBerthPlanRequest {
  yard_slot_ids: number[];
  tasks?: { yard_slot_id: number; task_type?: string; team_id?: number }[];
  team_id?: number;
}
