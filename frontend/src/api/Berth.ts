import { mockData } from "../mocks/seedData";
import type { Berth } from "../types/Berth";

const endpoint = "/api/berth";

export async function listBerth(): Promise<Berth[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.berth as unknown as Berth[])];
}

export async function saveBerth(payload: Berth) {
  console.info("save Berth", payload);
  return payload;
}
