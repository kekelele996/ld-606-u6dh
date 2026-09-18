import { useMemo } from "./useMemoShim";
import type { BerthPlan } from "../types/BerthPlan";

export interface BerthConflict {
  planId: number;
  otherPlanId: number;
  berthId: number;
}

/** 半开区间重叠：[aStart, aEnd) ∩ [bStart, bEnd)，端点相接不算。 */
const overlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart < bEnd && bStart < aEnd;

const ACTIVE = ["APPROVED", "BERTHING"];

/**
 * 靠泊冲突检测：
 * 返回每个计划与同泊位上「已审批/靠泊中」计划的时段重叠情况。
 * DRAFT/CONFLICT 计划命中重叠时，审批接口也会以 BERTH_TIME_OVERLAP 整次拒绝。
 */
export function useBerthConflict(plans: BerthPlan[] = []) {
  return useMemo(() => {
    const conflicts: BerthConflict[] = [];
    const conflictPlanIds = new Set<number>();

    for (const plan of plans) {
      if (ACTIVE.includes(plan.status)) continue;
      const hit = plans.find(
        (other) =>
          other.id !== plan.id &&
          other.berth_id === plan.berth_id &&
          ACTIVE.includes(other.status) &&
          overlap(
            plan.planned_arrival,
            plan.planned_departure,
            other.planned_arrival,
            other.planned_departure
          )
      );
      if (hit) {
        conflicts.push({ planId: plan.id, otherPlanId: hit.id, berthId: plan.berth_id });
        conflictPlanIds.add(plan.id);
      }
    }

    return {
      conflicts,
      conflictPlanIds,
      hasConflict: (planId: number) => conflictPlanIds.has(planId),
      total: conflicts.length
    };
  }, [plans]);
}
