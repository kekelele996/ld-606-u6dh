import { db } from "../config/inMemoryDb";
import type { YardSlot } from "../models/YardSlot";
import { isTimeOverlap } from "../utils/timeOverlap";
import type { BerthPlan } from "../models/BerthPlan";

const OCCUPIED_STATUSES = ["RESERVED", "OCCUPIED", "LOCKED"];

export const yardSlotRepository = {
  findAll: (): YardSlot[] => db.getTables().yardSlot,
  findById: (id: number, tables = db.getTables()): YardSlot | undefined =>
    tables.yardSlot.find((row) => row.id === id),
  /**
   * 箱位是否已被「占用」：
   * 1) 箱位自身状态为 RESERVED/OCCUPIED/LOCKED；
   * 2) 或存在已审批/靠泊中且时段重叠的计划（箱位未释放只能挂一份）。
   */
  isOccupied(slotId: number, plan: BerthPlan, tables = db.getTables()): boolean {
    const slot = tables.yardSlot.find((row) => row.id === slotId);
    if (!slot) return false;
    if (OCCUPIED_STATUSES.includes(slot.slot_status)) return true;
    const tasks = tables.workTask.filter(
      (task) => task.yard_slot_id === slotId && task.berth_plan_id !== plan.id
    );
    return tasks.some((task) => {
      const owner = tables.berthPlan.find((row) => row.id === task.berth_plan_id);
      if (!owner || !["APPROVED", "BERTHING"].includes(owner.status)) return false;
      return isTimeOverlap(
        plan.planned_arrival,
        plan.planned_departure,
        owner.planned_arrival,
        owner.planned_departure
      );
    });
  },
  /** 返回占用该箱位的已审批计划（生成失败原因时给出计划号）。 */
  findOccupyingPlan(slotId: number, plan: BerthPlan, tables = db.getTables()): BerthPlan | undefined {
    const tasks = tables.workTask.filter(
      (task) => task.yard_slot_id === slotId && task.berth_plan_id !== plan.id
    );
    for (const task of tasks) {
      const owner = tables.berthPlan.find((row) => row.id === task.berth_plan_id);
      if (
        owner &&
        ["APPROVED", "BERTHING"].includes(owner.status) &&
        isTimeOverlap(
          plan.planned_arrival,
          plan.planned_departure,
          owner.planned_arrival,
          owner.planned_departure
        )
      ) {
        return owner;
      }
    }
    return undefined;
  },
  save: (row: unknown): unknown => row
};
