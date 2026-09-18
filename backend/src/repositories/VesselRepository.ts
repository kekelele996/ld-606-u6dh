import { db } from "../config/inMemoryDb";
import type { Vessel } from "../models/Vessel";

export const vesselRepository = {
  findAll: (): Vessel[] => db.getTables().vessel,
  save: (row: unknown): unknown => row
};
