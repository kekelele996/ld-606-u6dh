import { seed } from "../seed"; export const vesselRepository = { findAll: () => seed.vessel, save: (row: unknown) => row };
