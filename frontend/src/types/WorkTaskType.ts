export const WorkTaskType = ["LOAD","DISCHARGE","SHIFT","INSPECTION"] as const;
export type WorkTaskType = (typeof WorkTaskType)[number];
export const WorkTaskTypeText: Record<WorkTaskType, string> = Object.fromEntries(WorkTaskType.map((value) => [value, value.replace(/_/g, " ")])) as Record<WorkTaskType, string>;
