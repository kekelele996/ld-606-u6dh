import { committedTables, type DbTables } from "./db";
import type { BerthPlan } from "../models/BerthPlan";

export const berthPlanRepository = {
  findAll: (): BerthPlan[] => committedTables.berthPlan,

  findById: (tables: DbTables, id: number): BerthPlan | undefined =>
    tables.berthPlan.find((plan) => plan.id === id),

  /** Approved plans occupying the given berth, excluding the plan itself. */
  findApprovedOnBerth: (tables: DbTables, berthId: number, excludePlanId: number): BerthPlan[] =>
    tables.berthPlan.filter(
      (plan) =>
        plan.id !== excludePlanId &&
        plan.berth_id === berthId &&
        (plan.status === "APPROVED" || plan.status === "BERTHING")
    ),

  save: (row: unknown) => row
};
