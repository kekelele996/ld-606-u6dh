import { mockData } from "../mocks/seedData";
import { apiFetch } from "./client";
import type { ApprovePlanResult, BerthPlan, BerthPlanDetail } from "../types/BerthPlan";

const endpoint = "/api/berth-plan";

export async function listBerthPlan(): Promise<BerthPlan[]> {
  try {
    return await apiFetch<BerthPlan[]>(endpoint);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return [...(mockData.berthPlan as unknown as BerthPlan[])];
  }
}

export async function getBerthPlanDetail(id: number): Promise<BerthPlanDetail> {
  return apiFetch<BerthPlanDetail>(`${endpoint}/${id}`);
}

export interface ApproveOptions {
  /** Optimistic-lock version read from the detail page. */
  expectedVersion?: number;
  slotIds?: number[];
}

/**
 * Approval returns 409 on business rejection (overlap / occupied slot /
 * concurrent loser). The body still carries ok:false + reason, which the
 * detail page renders; 403 means the dispatcher role is missing.
 */
export async function approveBerthPlan(id: number, options: ApproveOptions = {}): Promise<ApprovePlanResult> {
  try {
    return await apiFetch<ApprovePlanResult>(`${endpoint}/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({
        expectedVersion: options.expectedVersion,
        slotIds: options.slotIds
      })
    });
  } catch (error) {
    const e = error as { status?: number; body?: ApprovePlanResult };
    if (e.status === 409 && e.body) return e.body;
    throw error;
  }
}

export async function saveBerthPlan(payload: BerthPlan) {
  console.info("save BerthPlan", payload);
  return payload;
}
