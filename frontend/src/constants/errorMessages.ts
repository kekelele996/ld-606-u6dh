export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  BERTH_PLAN_NOT_FOUND: "靠泊计划不存在，无法审批",
  BERTH_PLAN_ALREADY_APPROVED: "该计划已审批通过，箱位释放前同一计划只允许挂一份已审批计划",
  BERTH_PLAN_NOT_APPROVABLE: "计划当前状态不可提交审批",
  BERTH_TIME_OVERLAP: "泊位时段与其它已审批计划重叠，已整次拒绝",
  YARD_SLOT_NOT_FOUND: "指定堆场箱位不存在",
  YARD_SLOT_OCCUPIED: "指定堆场箱位已被占用，已整次拒绝",
  YARD_SLOT_LOCKED: "指定堆场箱位被人工锁定/占用",
  APPROVAL_RACE_LOST: "该计划刚被其他调度员审批成功，请刷新后重试"
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
