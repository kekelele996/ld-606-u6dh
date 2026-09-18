export const WorkTaskStatus = ["PENDING", "ASSIGNED", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
export type WorkTaskStatus = (typeof WorkTaskStatus)[number];
