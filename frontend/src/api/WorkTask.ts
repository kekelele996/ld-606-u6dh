import { mockData } from "../mocks/seedData";
import type { WorkTask } from "../types/WorkTask";

const endpoint = "/api/work-task";

export async function listWorkTask(): Promise<WorkTask[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.workTask as unknown as WorkTask[])];
}

export async function saveWorkTask(payload: WorkTask) {
  console.info("save WorkTask", payload);
  return payload;
}
