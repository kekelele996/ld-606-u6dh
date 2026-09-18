import { seed } from "../seed"; export const yardSlotRepository = { findAll: () => seed.yardSlot, save: (row: unknown) => row };
