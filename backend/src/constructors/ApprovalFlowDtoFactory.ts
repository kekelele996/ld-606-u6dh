import type { ApprovalFlow } from "../models/ApprovalFlow";

/** 审批流转记录构造器：详情页的「最新流转结果」由它保证字段完整。 */
export const createApprovalFlowDto = (
  overrides: Partial<ApprovalFlow> = {}
): ApprovalFlow => ({
  id: 0,
  berth_plan_id: 0,
  result: "REJECTED",
  reason: "",
  dispatcher_id: 0,
  occupied_slot_ids: "",
  created_task_ids: "",
  created_at: new Date(0).toISOString(),
  ...overrides
});
