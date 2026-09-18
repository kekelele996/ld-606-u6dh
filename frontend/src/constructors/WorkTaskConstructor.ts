import type { WorkTask } from "../types/WorkTask";

export const createDefaultWorkTask = (overrides: Partial<WorkTask> = {}): WorkTask => ({
  id: 1 as never,
  berth_plan_id: 1 as never,
  yard_slot_id: 1 as never,
  task_type: "CONFLICT" as never,
  team_id: 1 as never,
  status: "CONFLICT" as never,
  planned_start: "planned start 1" as never,
  finished_at: "2026-06-11T09:00:00Z" as never,
  ...overrides
});

export const createWorkTaskForm = createDefaultWorkTask;
export const createWorkTaskResponse = createDefaultWorkTask;
