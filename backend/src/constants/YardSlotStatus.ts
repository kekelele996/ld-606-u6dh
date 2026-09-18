export const YardSlotStatus = ["EMPTY","RESERVED","OCCUPIED","LOCKED"] as const;
export type YardSlotStatus = (typeof YardSlotStatus)[number];
