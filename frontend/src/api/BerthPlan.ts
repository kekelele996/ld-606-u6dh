import { mockData } from "../mocks/seedData";
import type { BerthPlan } from "../types/BerthPlan";

const endpoint = "/api/berth-plan";

export async function listBerthPlan(): Promise<BerthPlan[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.berthPlan as unknown as BerthPlan[])];
}

export async function saveBerthPlan(payload: BerthPlan) {
  console.info("save BerthPlan", payload);
  return payload;
}
