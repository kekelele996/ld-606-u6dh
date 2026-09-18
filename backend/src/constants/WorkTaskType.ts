export const WorkTaskType = ["LOAD","DISCHARGE","SHIFT","INSPECTION"] as const;
export type WorkTaskType = (typeof WorkTaskType)[number];
