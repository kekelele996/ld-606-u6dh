import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES, fillMessage } from "../constants/errorMessages";
import { DomainError } from "../utils/DomainError";
import { committedTables } from "../repositories/db";
import { berthPlanRepository } from "../repositories/BerthPlanRepository";
import { yardSlotRepository } from "../repositories/YardSlotRepository";
import { workTaskRepository } from "../repositories/WorkTaskRepository";
import { createBerthPlanDto, createBerthPlanDetailDto } from "../constructors/BerthPlanDtoFactory";
import { approvePlanService } from "./approvePlanService";
import type { ApprovePlanCommand, ApprovePlanResult } from "./approvePlanService";
import type { BerthPlanDetailDto } from "../constructors/BerthPlanDtoFactory";

export const berthPlanService = {
  list: () => berthPlanRepository.findAll(),

  create: (row: Record<string, unknown>) =>
    createBerthPlanDto(row as Partial<ReturnType<typeof createBerthPlanDto>>),

  /** Detail view: plan + requested/held slots + opened tasks + latest flow result. */
  detail: (id: number): BerthPlanDetailDto => {
    const tables = committedTables;
    const plan = berthPlanRepository.findById(tables, id);
    if (!plan) {
      throw new DomainError(
        ERROR_CODES.BERTH_PLAN_NOT_FOUND,
        fillMessage(ERROR_MESSAGES.BERTH_PLAN_NOT_FOUND, { id }),
        { id },
        404
      );
    }
    const slots = yardSlotRepository.findByIds(tables, plan.yard_slot_ids);
    const tasks = workTaskRepository.findByPlan(tables, plan.id);
    return createBerthPlanDetailDto(plan, slots, tasks);
  },

  approve: (command: ApprovePlanCommand): Promise<ApprovePlanResult> =>
    approvePlanService.approve(command)
};
