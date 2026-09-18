import type { Request, Response, NextFunction } from "express";
import { berthPlanService } from "../services/BerthPlanService";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { DomainError } from "../utils/DomainError";

/**
 * Controller-level wrapping: business rejections (overlap / slot occupied /
 * permission) are returned as a structured body with ok:false so the detail
 * page can render the reason; unexpected errors still fall through to the
 * global errorHandlerMiddleware.
 */
const toControllerError = (res: Response, error: unknown) => {
  if (error instanceof DomainError) {
    return res.status(error.status).json({ code: error.code, message: error.message, vars: error.vars });
  }
  return res.status(500).json({ code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED });
};

export const berthPlanController = {
  list: (_req: Request, res: Response) => res.json(berthPlanService.list()),

  detail: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(berthPlanService.detail(Number(req.params.id)));
    } catch (error) {
      if (error instanceof DomainError) return toControllerError(res, error);
      next(error);
    }
  },

  create: (req: Request, res: Response) => res.status(201).json(berthPlanService.create(req.body)),

  approve: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new DomainError(ERROR_CODES.AUTH_REQUIRED, ERROR_MESSAGES.AUTH_REQUIRED, {}, 401);
      }
      const body = (req.body ?? {}) as { slotIds?: number[]; expectedVersion?: number };
      const result = await berthPlanService.approve({
        planId: Number(req.params.id),
        dispatcherId: req.user.id,
        expectedVersion: typeof body.expectedVersion === "number" ? body.expectedVersion : undefined,
        slotIds: Array.isArray(body.slotIds) ? body.slotIds.map(Number) : undefined
      });

      // Business-level rejection (overlap / slot occupied / concurrent loser)
      // -> 409 with the persisted reason; the three guarded resources were
      // never modified, but the flow record is available on the plan.
      if (!result.ok) {
        return res.status(409).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof DomainError) return toControllerError(res, error);
      next(error);
    }
  }
};
