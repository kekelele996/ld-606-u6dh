import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { BusinessError } from "../utils/BusinessError";
import type { Role } from "../constants/roles";

/**
 * RBAC 路由守卫：角色不在白名单内直接拒绝（403）。
 * service 层会再做一次同样的判断，避免绕过路由直接调用。
 */
export const rbacMiddleware = (roles: Role[] = []): RequestHandler => (req, _res, next) => {
  if (roles.length === 0) {
    next();
    return;
  }
  const role = req.user?.role;
  if (!role || !roles.includes(role)) {
    next(new BusinessError(ERROR_CODES.RBAC_DENIED, ERROR_MESSAGES.RBAC_DENIED, 403));
    return;
  }
  next();
};
