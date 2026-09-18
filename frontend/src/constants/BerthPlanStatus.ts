export const BerthPlanStatus = ["DRAFT","CONFLICT","APPROVED","BERTHING","DEPARTED","CANCELLED"] as const;
export type BerthPlanStatus = (typeof BerthPlanStatus)[number];
export const BerthPlanStatusText: Record<BerthPlanStatus, string> = Object.fromEntries(BerthPlanStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<BerthPlanStatus, string>;
