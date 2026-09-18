import { Injectable, signal } from "@angular/core";
import type { YardSlot } from "../types/YardSlot";
import { listYardSlot } from "../api/YardSlot";

/** 堆场箱位 store：审批面板的箱位多选依赖它。 */
@Injectable({ providedIn: "root" })
export class YardSlotStore {
  readonly rows = signal<YardSlot[]>([]);

  async loadList(): Promise<void> {
    this.rows.set(await listYardSlot());
  }

  /** 可被占用的箱位：仅 EMPTY 可选择。 */
  available(): YardSlot[] {
    return this.rows().filter((slot) => slot.slot_status === "EMPTY");
  }
}
