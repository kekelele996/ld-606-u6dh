/** 靠泊计划审批流转记录（详情页展示最新流转结果与失败原因）。 */
export interface ApprovalFlow {
  id: number;
  berth_plan_id: number;
  result: "APPROVED" | "REJECTED";
  reason: string;
  dispatcher_id: number;
  occupied_slot_ids: string;
  created_task_ids: string;
  created_at: string;
}
