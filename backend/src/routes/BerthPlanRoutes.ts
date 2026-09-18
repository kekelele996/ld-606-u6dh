import { Router } from "express";
import { berthPlanController } from "../controllers/BerthPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import { DISPATCHER_ROLES } from "../constants/UserRole";

const router = Router();

router.get("/", berthPlanController.list);
router.post("/", berthPlanController.create);
router.get("/:id", berthPlanController.detail);
// Approval is a dispatcher-only write. The route guard rejects insufficient
// scheduling privilege with 403 before any business rule is evaluated.
router.post("/:id/approve", rbacMiddleware(DISPATCHER_ROLES), berthPlanController.approve);

export default router;
