import { vesselRepository } from "../repositories/VesselRepository"; export const vesselService = { list: () => vesselRepository.findAll(), create: (row: unknown) => vesselRepository.save(row) };
