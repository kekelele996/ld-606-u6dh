import { Router } from "express";
import { berthPlanController } from "../controllers/BerthPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import { APPROVE_ROLES } from "../constants/roles";

const router = Router();

router.get("/", berthPlanController.list);
router.post("/", berthPlanController.create);

// 详情页：展示失败原因与最新流转结果
router.get("/:id", berthPlanController.detail);

// 审批仅调度员/管理员：RBAC 守卫 + service 内二次校验
router.post("/:id/approve", rbacMiddleware(APPROVE_ROLES), berthPlanController.approve);

export default router;
