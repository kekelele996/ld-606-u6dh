import { Injectable, signal } from "@angular/core";
import type { WorkTask } from "../types/WorkTask";
import { listWorkTask } from "../api/WorkTask";

@Injectable({ providedIn: "root" })
export class WorkTaskStore {
  readonly rows = signal<WorkTask[]>([]);
  async loadList(): Promise<void> {
    this.rows.set(await listWorkTask());
  }
}
