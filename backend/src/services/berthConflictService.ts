import type { BerthPlan } from "../models/BerthPlan";

/**
 * Half-open interval overlap: [arrival, departure).
 * Touching boundaries (one plan departs exactly when the next arrives) are allowed.
 */
export const isTimeOverlap = (
  arrivalA: string,
  departureA: string,
  arrivalB: string,
  departureB: string
): boolean => new Date(arrivalA) < new Date(departureB) && new Date(arrivalB) < new Date(departureA);

export interface BerthConflictResult {
  conflict: boolean;
  overlapPlanId?: number;
}

export const checkBerthTimeConflict = (
  candidate: Pick<BerthPlan, "berth_id" | "planned_arrival" | "planned_departure">,
  approvedPlans: BerthPlan[]
): BerthConflictResult => {
  const hit = approvedPlans.find((plan) =>
    isTimeOverlap(
      candidate.planned_arrival,
      candidate.planned_departure,
      plan.planned_arrival,
      plan.planned_departure
    )
  );
  return hit ? { conflict: true, overlapPlanId: hit.id } : { conflict: false };
};
