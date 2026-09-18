export const YardSlotStatus = ["EMPTY","RESERVED","OCCUPIED","LOCKED"] as const;
export type YardSlotStatus = (typeof YardSlotStatus)[number];
export const YardSlotStatusText: Record<YardSlotStatus, string> = Object.fromEntries(YardSlotStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<YardSlotStatus, string>;
