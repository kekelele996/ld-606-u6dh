import { seed } from "../seed"; export const berthPlanRepository = { findAll: () => seed.berthPlan, save: (row: unknown) => row };
