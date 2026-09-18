import type { Berth } from "../types/Berth";

export const createDefaultBerth = (overrides: Partial<Berth> = {}): Berth => ({
  id: 1 as never,
  berth_code: "berth code 1" as never,
  length_m: "length m 1" as never,
  water_depth_m: "water depth m 1" as never,
  berth_type: "CONFLICT" as never,
  current_status: "CONFLICT" as never,
  safety_note: "safety note 1" as never,
  ...overrides
});

export const createBerthForm = createDefaultBerth;
export const createBerthResponse = createDefaultBerth;
