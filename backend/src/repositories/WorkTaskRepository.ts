import { db } from "../config/inMemoryDb";
import type { WorkTask } from "../models/WorkTask";

export const workTaskRepository = {
  findAll: (): WorkTask[] => db.getTables().workTask,
  findByPlan: (planId: number, tables = db.getTables()): WorkTask[] =>
    tables.workTask.filter((row) => row.berth_plan_id === planId),
  nextId: (tables = db.getTables()): number =>
    tables.workTask.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  /** 事务内直接写入快照表。 */
  insert(task: WorkTask, tables: ReturnType<typeof db.getTables>): WorkTask {
    tables.workTask.push(task);
    return task;
  },
  save: (row: unknown): unknown => row
};
