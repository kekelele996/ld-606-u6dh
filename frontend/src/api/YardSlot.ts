import { mockData } from "../mocks/seedData";
import type { YardSlot } from "../types/YardSlot";

const endpoint = "/api/yard-slot";

export async function listYardSlot(): Promise<YardSlot[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.yardSlot as unknown as YardSlot[])];
}

export async function saveYardSlot(payload: YardSlot) {
  console.info("save YardSlot", payload);
  return payload;
}
