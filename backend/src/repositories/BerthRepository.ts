import { db } from "../config/inMemoryDb";
import type { Berth } from "../models/Berth";

export const berthRepository = {
  findAll: (): Berth[] => db.getTables().berth,
  findById: (id: number, tables = db.getTables()): Berth | undefined =>
    tables.berth.find((row) => row.id === id),
  save: (row: unknown): unknown => row
};
