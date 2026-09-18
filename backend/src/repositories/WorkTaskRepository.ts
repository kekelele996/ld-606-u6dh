import { committedTables, type DbTables } from "./db";
import type { WorkTask } from "../models/WorkTask";

export const workTaskRepository = {
  findAll: (): WorkTask[] => committedTables.workTask,

  findByPlan: (tables: DbTables, planId: number): WorkTask[] =>
    tables.workTask.filter((task) => task.berth_plan_id === planId),

  nextId: (tables: DbTables): number =>
    tables.workTask.reduce((max, task) => Math.max(max, task.id), 0) + 1,

  insert: (tables: DbTables, row: WorkTask): WorkTask => {
    tables.workTask.push(row);
    return row;
  },

  save: (row: unknown) => row
};
