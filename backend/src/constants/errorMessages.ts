/**
 * 集中维护的错误消息模板。
 * {slot} / {berth} / {plan} 等占位由 utils/formatter 的 fillTemplate 统一填充。
 */
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied: 仅调度员（或管理员）可以审批靠泊计划",
  VALIDATION_FAILED: "invalid payload: 审批请求必须指定至少一个堆场箱位",
  RATE_LIMITED: "too many requests",
  BERTH_PLAN_NOT_FOUND: "靠泊计划 #{plan} 不存在，无法审批",
  BERTH_PLAN_ALREADY_APPROVED: "靠泊计划 #{plan} 已审批通过，箱位释放前同一计划只允许挂一份已审批计划",
  BERTH_PLAN_NOT_APPROVABLE: "靠泊计划 #{plan} 当前状态为 {status}，只有草稿/冲突状态可提交审批",
  BERTH_TIME_OVERLAP: "泊位 {berth} 在 {arrival} ~ {departure} 时段已被已审批计划 #{plan} 占用，泊位时段重叠",
  YARD_SLOT_NOT_FOUND: "堆场箱位 #{slot} 不存在",
  YARD_SLOT_OCCUPIED: "堆场箱位 #{slot} 已被已审批计划 #{plan} 占用，箱位释放前不可重复占用",
  YARD_SLOT_LOCKED: "堆场箱位 #{slot} 当前为 {status} 状态（人工占用/锁定），不可再次占用",
  APPROVAL_RACE_LOST: "审批冲突：该计划刚被其他调度员审批成功，请刷新后重试"
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
