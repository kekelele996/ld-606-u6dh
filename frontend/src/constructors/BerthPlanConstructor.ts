import type { BerthPlan } from "../types/BerthPlan";

export const createDefaultBerthPlan = (overrides: Partial<BerthPlan> = {}): BerthPlan => ({
  id: 1 as never,
  vessel_id: 1 as never,
  berth_id: 1 as never,
  planned_arrival: "planned arrival 1" as never,
  planned_departure: "planned departure 1" as never,
  priority: "priority 1" as never,
  status: "CONFLICT" as never,
  dispatcher_id: 1 as never,
  ...overrides
});

export const createBerthPlanForm = createDefaultBerthPlan;
export const createBerthPlanResponse = createDefaultBerthPlan;
