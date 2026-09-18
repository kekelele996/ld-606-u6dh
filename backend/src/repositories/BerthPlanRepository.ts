import { db } from "../config/inMemoryDb";
import type { BerthPlan } from "../models/BerthPlan";

export const berthPlanRepository = {
  findAll: (): BerthPlan[] => db.getTables().berthPlan,
  findById: (id: number, tables = db.getTables()): BerthPlan | undefined =>
    tables.berthPlan.find((row) => row.id === id),
  /** 某泊位上已占用时段的已审批/靠泊中计划（冲突检测用）。 */
  findOverlappingOnBerth(
    berthId: number,
    arrival: string,
    departure: string,
    tables = db.getTables()
  ): BerthPlan[] {
    const activeStatuses = ["APPROVED", "BERTHING"];
    return tables.berthPlan.filter(
      (row) =>
        row.berth_id === berthId &&
        activeStatuses.includes(row.status) &&
        arrival < row.planned_departure &&
        row.planned_arrival < departure
    );
  },
  save: (row: unknown): unknown => row
};
