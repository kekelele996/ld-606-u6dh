/**
 * 操作日志模板，集中维护。
 * 每个实体 ≥ 4 条；所有写操作都必须记录日志。
 * 审批相关写操作使用 BerthPlan.approve* / YardSlot.occupy / WorkTask.dispatch。
 */
export const LOG_TEMPLATES = {
  Vessel: ["Vessel.create", "Vessel.update", "Vessel.status", "Vessel.export"],
  Berth: ["Berth.create", "Berth.update", "Berth.status", "Berth.export"],
  BerthPlan: [
    "BerthPlan.create",
    "BerthPlan.update",
    "BerthPlan.status",
    "BerthPlan.export",
    "BerthPlan.approve.success: plan=#{plan} slots={slots} tasks={tasks} dispatcher=#{dispatcher}",
    "BerthPlan.approve.reject: plan=#{plan} code={code} reason={reason} dispatcher=#{dispatcher}"
  ],
  YardSlot: ["YardSlot.create", "YardSlot.update", "YardSlot.status", "YardSlot.export", "YardSlot.occupy: slot=#{slot} plan=#{plan}", "YardSlot.release: slot=#{slot} plan=#{plan}"],
  WorkTask: ["WorkTask.create", "WorkTask.update", "WorkTask.status", "WorkTask.export", "WorkTask.dispatch: task=#{task} plan=#{plan} slot=#{slot}"]
};
