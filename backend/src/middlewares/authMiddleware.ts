import type { RequestHandler } from "express";
import type { Role } from "../constants/roles";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: number; role: Role };
    }
  }
}

/**
 * 极简鉴权：从 x-user-id / x-role 头解析当前用户（JWT 在网关层校验）。
 * 缺省按调度员处理，方便本地联调。
 */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const role = (req.header("x-role") ?? "DISPATCHER") as Role;
  const id = Number(req.header("x-user-id") ?? 1);
  req.user = { id: Number.isFinite(id) ? id : 1, role };
  next();
};
