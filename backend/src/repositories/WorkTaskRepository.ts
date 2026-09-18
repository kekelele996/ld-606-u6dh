import { seed } from "../seed"; export const workTaskRepository = { findAll: () => seed.workTask, save: (row: unknown) => row };
