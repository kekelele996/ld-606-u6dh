import type { ErrorRequestHandler } from "express";
import { BusinessError } from "../utils/BusinessError";

/**
 * 全局错误处理：只负责把异常落为统一响应结构，
 * 不吞业务错误码（service/controller 已各自包装）。
 */
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof BusinessError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }
  const status = (err as { status?: number })?.status ?? 500;
  const code = (err as { code?: string })?.code ?? "INTERNAL_ERROR";
  res.status(status).json({ code, message: (err as Error)?.message ?? "internal error" });
};
