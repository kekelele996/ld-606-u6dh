export interface WorkTask {
  id: number;
  berth_plan_id: number;
  yard_slot_id: number;
  task_type: string;
  team_id: number;
  status: string;
  planned_start: string;
  finished_at: string;
}
