export const BerthPlanStatus = ["DRAFT","CONFLICT","APPROVED","BERTHING","DEPARTED","CANCELLED"] as const;
export type BerthPlanStatus = (typeof BerthPlanStatus)[number];
