import type { WorkTask } from "../models/WorkTask";

/** 审批通过后开出的装卸任务默认 DTO。 */
export const createWorkTaskDto = (
  overrides: Partial<WorkTask> = {}
): WorkTask => ({
  id: 0,
  berth_plan_id: 0,
  yard_slot_id: 0,
  task_type: "DISCHARGE",
  team_id: 0,
  status: "PENDING",
  planned_start: "",
  finished_at: "",
  ...overrides
});
