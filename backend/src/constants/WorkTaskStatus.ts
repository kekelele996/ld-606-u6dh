export const WorkTaskStatus = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type WorkTaskStatus = (typeof WorkTaskStatus)[number];
