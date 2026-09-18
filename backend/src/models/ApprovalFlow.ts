/**
 * 靠泊计划审批流转记录。
 * 每次审批（无论成功/失败）都追加一条，详情页据此展示「最新流转结果 + 失败原因」。
 */
export interface ApprovalFlow {
  id: number;
  berth_plan_id: number;
  result: string; // ApprovalResult: APPROVED / REJECTED
  reason: string; // 成功时为空串；拒绝时为面向用户的失败原因
  dispatcher_id: number;
  occupied_slot_ids: string; // 逗号分隔，失败时为空串
  created_task_ids: string; // 逗号分隔，失败时为空串
  created_at: string;
}
