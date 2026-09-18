import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../constants/UserRole";
import type { AuthenticatedUser } from "../types/AuthenticatedUser";

const JWT_SECRET = process.env.JWT_SECRET ?? "port-yard-dev-secret";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const normalizeRole = (raw: string | undefined): AuthenticatedUser["role"] =>
  (UserRole as readonly string[]).includes(raw ?? "") ? (raw as UserRole) : "VIEWER";

/**
 * Resolves the caller from a signed JWT (Authorization: Bearer <token>) when
 * present; otherwise falls back to the x-user-id / x-role headers used by
 * the local review environment. Defaults to read-only VIEWER so a missing
 * identity is never silently granted dispatcher rights.
 */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const authHeader = req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as jwt.JwtPayload;
      req.user = {
        id: Number(payload.sub ?? payload.id ?? 0),
        role: normalizeRole(String(payload.role ?? "VIEWER")),
        name: String(payload.name ?? "")
      };
    } catch {
      req.user = { id: 0, role: "VIEWER", name: "" };
    }
  } else {
    req.user = {
      id: Number(req.header("x-user-id") ?? 0),
      role: normalizeRole(req.header("x-role")),
      name: req.header("x-user-name") ?? ""
    };
  }
  next();
};
