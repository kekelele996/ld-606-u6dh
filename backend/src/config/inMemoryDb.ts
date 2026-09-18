import { seed } from "../seed";
import type { BerthPlan } from "../models/BerthPlan";
import type { Vessel } from "../models/Vessel";
import type { Berth } from "../models/Berth";
import type { YardSlot } from "../models/YardSlot";
import type { WorkTask } from "../models/WorkTask";
import type { ApprovalFlow } from "../models/ApprovalFlow";

/**
 * 本地内存数据库。
 * 所有写操作只能在 db.runTransaction 内进行，保证「一次保存」语义。
 */
export interface DatabaseShape {
  vessel: Vessel[];
  berth: Berth[];
  berthPlan: BerthPlan[];
  yardSlot: YardSlot[];
  workTask: WorkTask[];
  approvalFlow: ApprovalFlow[];
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** 用种子数据构造一份全新的可变数据（深拷贝，避免改到只读种子）。 */
const buildInitialData = (): DatabaseShape => ({
  vessel: clone(seed.vessel) as unknown as Vessel[],
  berth: clone(seed.berth) as unknown as Berth[],
  berthPlan: clone(seed.berthPlan) as unknown as BerthPlan[],
  yardSlot: clone(seed.yardSlot) as unknown as YardSlot[],
  workTask: clone(seed.workTask) as unknown as WorkTask[],
  approvalFlow: clone(seed.approvalFlow ?? []) as unknown as ApprovalFlow[]
});

let data: DatabaseShape = buildInitialData();

export const db = {
  /** 只读快照访问（列表接口等非事务场景）。 */
  getTables(): DatabaseShape {
    return data;
  },
  reset(): void {
    data = buildInitialData();
  },
  /**
   * 事务：回调内收到的是当前数据的深拷贝，
   * 只有未抛错时整体替换提交；任一步抛错则全部回滚。
   */
  runTransaction<T>(work: (tables: DatabaseShape) => T): T {
    const snapshot = clone(data);
    // 回调里的所有改动都发生在快照上；只有正常返回时才整体提交。
    // 任一步抛错：data 仍指向旧对象，审批状态 / 箱位占用 / 任务三项全部保持原样。
    const result = work(snapshot);
    data = snapshot;
    return result;
  }
};
