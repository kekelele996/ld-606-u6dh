import type { Vessel } from "../types/Vessel";

export const createDefaultVessel = (overrides: Partial<Vessel> = {}): Vessel => ({
  id: 1 as never,
  vessel_name: "vessel name 1" as never,
  imo_no: "imo no 1" as never,
  carrier: "carrier 1" as never,
  length_m: "length m 1" as never,
  draft_m: "draft m 1" as never,
  eta: "eta 1" as never,
  etd: "etd 1" as never,
  status: "CONFLICT" as never,
  ...overrides
});

export const createVesselForm = createDefaultVessel;
export const createVesselResponse = createDefaultVessel;
