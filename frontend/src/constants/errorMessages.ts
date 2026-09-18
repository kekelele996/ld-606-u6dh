export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "调度权限不足，仅调度员可审批靠泊计划",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  BERTH_PLAN_NOT_FOUND: "靠泊计划不存在或已被删除",
  BERTH_PLAN_NOT_APPROVABLE: "计划当前状态不可审批（仅草稿/冲突计划可提交）",
  BERTH_TIME_OVERLAP: "泊位时段与其他已审批计划重叠",
  YARD_SLOT_NOT_FOUND: "指定堆场箱位不存在",
  YARD_SLOT_OCCUPIED: "指定箱位已被其他已审批计划占用，释放前无法重复占用",
  YARD_SLOT_LOCKED: "指定箱位已锁定，无法分配",
  APPROVE_CONCURRENT_CONFLICT: "其他调度员已先行处理该计划，请刷新后重试"
} as const;

/** 详情页优先展示后端返回的具体原因，错误码用于命中下方中文解释。 */
export const resolveApproveError = (code: string | undefined, fallback?: string | null): string => {
  if (fallback) return fallback;
  const hit = (ERROR_MESSAGES as Record<string, string>)[code ?? ""];
  return hit ?? "审批被拒绝，请检查计划与资源状态";
};
