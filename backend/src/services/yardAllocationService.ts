import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES, fillMessage } from "../constants/errorMessages";
import { DomainError } from "../utils/DomainError";
import { yardSlotRepository } from "../repositories/YardSlotRepository";
import type { DbTables } from "../repositories/db";
import type { YardSlot } from "../models/YardSlot";

export interface SlotAllocationResult {
  slots: YardSlot[];
}

/**
 * Every requested slot must exist and be free. A slot stays bound to a single
 * approved plan until release, so held_by_plan_id !== null (or LOCKED) rejects.
 * All checks run against the transaction snapshot; the caller stages the
 * occupation and the transaction commits plan+slots+tasks together.
 */
export const allocateYardSlots = (
  tables: DbTables,
  slotIds: number[]
): SlotAllocationResult => {
  const uniqueIds = [...new Set(slotIds)];
  const slots = yardSlotRepository.findByIds(tables, uniqueIds);

  if (slots.length !== uniqueIds.length) {
    const missing = uniqueIds.find((id) => !slots.some((slot) => slot.id === id));
    throw new DomainError(
      ERROR_CODES.YARD_SLOT_NOT_FOUND,
      fillMessage(ERROR_MESSAGES.YARD_SLOT_NOT_FOUND, { slotId: missing ?? -1 }),
      { slotId: missing ?? -1 },
      404
    );
  }

  const held = slots.find((slot) => slot.held_by_plan_id !== null);
  if (held) {
    throw new DomainError(
      ERROR_CODES.YARD_SLOT_OCCUPIED,
      fillMessage(ERROR_MESSAGES.YARD_SLOT_OCCUPIED, {
        slotId: held.id,
        planId: held.held_by_plan_id ?? -1
      }),
      { slotId: held.id, planId: held.held_by_plan_id as number }
    );
  }

  const locked = slots.find((slot) => slot.slot_status === "LOCKED");
  if (locked) {
    throw new DomainError(
      ERROR_CODES.YARD_SLOT_LOCKED,
      fillMessage(ERROR_MESSAGES.YARD_SLOT_LOCKED, { slotId: locked.id }),
      { slotId: locked.id }
    );
  }

  return { slots };
};
