import { berthRepository } from "../repositories/BerthRepository"; export const berthService = { list: () => berthRepository.findAll(), create: (row: unknown) => berthRepository.save(row) };
