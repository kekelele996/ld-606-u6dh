import type { Request, Response, NextFunction } from "express";
import { berthPlanService } from "../services/BerthPlanService";
import { berthApprovalService } from "../services/BerthApprovalService";
import type { ApproveBerthPlanPayload } from "../types/BerthPlanPayload";

/**
 * 靠泊计划控制器。
 * service 已包装业务异常；这里只负责把请求交给领域服务，
 * 审批错误继续向上抛给 errorHandlerMiddleware，保留错误码与失败原因。
 */
export const berthPlanController = {
  list: (_req: Request, res: Response) => res.json(berthPlanService.list()),

  create: (req: Request, res: Response) => res.status(201).json(berthPlanService.create(req.body)),

  /** 详情页：计划 + 最新流转结果（含失败原因）+ 已开任务。 */
  detail: (req: Request, res: Response, next: NextFunction) => {
    try {
      const planId = Number(req.params.id);
      res.json(berthApprovalService.getDetail(planId));
    } catch (error) {
      next(error);
    }
  },

  /** 审批：同时占用指定堆场箱位并开出装卸任务（三项一次保存）。 */
  approve: (req: Request, res: Response, next: NextFunction) => {
    const planId = Number(req.params.id);
    const payload = req.body as ApproveBerthPlanPayload;
    berthApprovalService
      .approve(planId, payload ?? {}, { id: req.user?.id ?? 1, role: req.user!.role })
      .then((result) => res.status(200).json(result))
      .catch(next);
  }
};
