import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { UserRole } from "../constants/UserRole";

/**
 * Route guard factory. Attaching rbacMiddleware([DISPATCHER]) to the approval
 * route makes "调度权限不足" an HTTP 403 rejection before any business check.
 */
export const rbacMiddleware = (roles: UserRole[] = []): RequestHandler => (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ code: ERROR_CODES.AUTH_REQUIRED, message: ERROR_MESSAGES.AUTH_REQUIRED });
    return;
  }
  if (roles.length > 0 && !roles.includes(req.user.role)) {
    res.status(403).json({
      code: ERROR_CODES.RBAC_DENIED,
      message: ERROR_MESSAGES.RBAC_DENIED,
      required: roles,
      actual: req.user.role
    });
    return;
  }
  next();
};
