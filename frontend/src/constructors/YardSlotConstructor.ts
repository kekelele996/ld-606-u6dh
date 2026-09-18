import type { YardSlot } from "../types/YardSlot";

export const createDefaultYardSlot = (overrides: Partial<YardSlot> = {}): YardSlot => ({
  id: 1 as never,
  yard_area: "yard area 1" as never,
  row_no: "row no 1" as never,
  bay_no: "bay no 1" as never,
  tier_no: "tier no 1" as never,
  container_no: "container no 1" as never,
  slot_status: "CONFLICT" as never,
  cargo_type: "CONFLICT" as never,
  ...overrides
});

export const createYardSlotForm = createDefaultYardSlot;
export const createYardSlotResponse = createDefaultYardSlot;
