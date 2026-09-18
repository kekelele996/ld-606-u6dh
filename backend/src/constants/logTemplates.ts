export const LOG_TEMPLATES = {
  Vessel: ["Vessel.create", "Vessel.update", "Vessel.status", "Vessel.export"],
  Berth: ["Berth.create", "Berth.update", "Berth.status", "Berth.export"],
  BerthPlan: [
    "BerthPlan.create",
    "BerthPlan.update",
    "BerthPlan.status",
    "BerthPlan.export",
    "BerthPlan.approve.submitted dispatcher={dispatcherId} plan={planId} slots={slotIds} taskType={taskType}",
    "BerthPlan.approve.committed plan={planId} status=APPROVED slots={slotIds} tasks={taskIds}",
    "BerthPlan.approve.rejected plan={planId} reason={reason}",
    "BerthPlan.approve.conflict plan={planId} code={code} by dispatcher={dispatcherId}"
  ],
  YardSlot: ["YardSlot.create", "YardSlot.update", "YardSlot.status", "YardSlot.export"],
  WorkTask: ["WorkTask.create", "WorkTask.update", "WorkTask.status", "WorkTask.export"]
};

export const renderLog = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
