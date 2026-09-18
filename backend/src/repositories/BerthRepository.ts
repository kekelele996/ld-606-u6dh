import { seed } from "../seed"; export const berthRepository = { findAll: () => seed.berth, save: (row: unknown) => row };
