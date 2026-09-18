import { committedTables, type DbTables } from "./db";
import type { YardSlot } from "../models/YardSlot";

export const yardSlotRepository = {
  findAll: (): YardSlot[] => committedTables.yardSlot,

  findByIds: (tables: DbTables, ids: number[]): YardSlot[] =>
    tables.yardSlot.filter((slot) => ids.includes(slot.id)),

  /** Slots currently held by an approved plan (released -> null). */
  findHeldByPlan: (tables: DbTables, planId: number): YardSlot[] =>
    tables.yardSlot.filter((slot) => slot.held_by_plan_id === planId),

  save: (row: unknown) => row
};
