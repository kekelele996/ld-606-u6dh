import { ERROR_CODES } from "./errorCodes";

export const ERROR_MESSAGES: Record<(typeof ERROR_CODES)[keyof typeof ERROR_CODES], string> = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied, dispatcher privilege required",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  BERTH_PLAN_NOT_FOUND: "berth plan {id} not found",
  BERTH_PLAN_NOT_APPROVABLE: "berth plan {id} is in status {status}, only DRAFT/CONFLICT plans can be approved",
  BERTH_TIME_OVERLAP: "berth {berthId} time window overlaps with approved plan {planId}",
  YARD_SLOT_NOT_FOUND: "yard slot {slotId} not found",
  YARD_SLOT_OCCUPIED: "yard slot {slotId} is already held by approved plan {planId}",
  YARD_SLOT_LOCKED: "yard slot {slotId} is locked and cannot be assigned",
  APPROVE_CONCURRENT_CONFLICT: "berth plan {id} was approved or changed by another dispatcher, please refresh and retry"
};

export const fillMessage = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
