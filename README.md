# 港口泊位与堆场协同系统

面向中小港口的船舶靠泊计划、泊位资源、堆场箱位和作业任务协同平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20106>

后端健康检查：<http://localhost:21106/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`；开发期数据为内存种子，重启即重置。
- 审批验收测试：`cd backend && npm run test:approval`


## 核心业务：靠泊计划审批（一次保存）

调度员在「泊位计划」页审批靠泊计划时，系统在**同一事务**内完成三件事：

1. 计划状态 `DRAFT/CONFLICT → APPROVED`；
2. 同时占用指定堆场箱位（`EMPTY → OCCUPIED`）；
3. 按箱位开出装卸任务（`WorkTask`，默认 `DISCHARGE/PENDING`）。

约束与行为：

- **一次保存 / 失败回滚**：审批状态、箱位占用、任务创建必须原子提交；任一步失败（泊位时段重叠、箱位已占用、权限不足、参数非法）三项全部保持原样，仅追加一条 `REJECTED` 流转记录。
- **一箱位一份计划**：箱位未释放前只能挂一份已审批计划；计划已审批后不可重复审批。
- **泊位时段重叠**：与同泊位上 `APPROVED/BERTHING` 计划时段重叠（半开区间，端点相接不算）时整次拒绝。
- **RBAC**：仅 `DISPATCHER`（调度）/ `ADMIN` 可审批，路由守卫与 service 双重校验，其它角色 403。
- **并发安全**：两名调度员同时点审批，审批临界区串行化，只可能有一份成功，落败方得到 `BERTH_PLAN_ALREADY_APPROVED`。
- **详情页可追溯**：`GET /api/berth-plan/:id` 返回计划、最新流转结果（`APPROVED/REJECTED`）、失败原因、历史流转与已开任务。

接口（详见「接口示例」）：

```text
POST /api/berth-plan/:id/approve   # body: {"yard_slot_ids":[2,3],"tasks":[{"yard_slot_id":2,"task_type":"DISCHARGE"}]}
GET  /api/berth-plan/:id           # 详情：最新流转结果 + 失败原因 + 已开任务
```

后端验收测试（覆盖原子性、回滚、重叠、占用、RBAC、并发只成功一份，共 34 项）：

```bash
cd backend && npm run test:approval
```


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Angular 17 + TypeScript + RxJS + NG-ZORRO + ECharts |
| 后端 | NestJS + TypeScript + TypeORM |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `port-yard`
- `FRONTEND_PORT`: 前端端口，默认 `20106`
- `BACKEND_PORT`: 后端端口，默认 `21106`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: port-yard`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-port-yard}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- BerthPlanStatus: constants/BerthPlanStatus、types/BerthPlanStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- YardSlotStatus: constants/YardSlotStatus、types/YardSlotStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- WorkTaskType: constants/WorkTaskType、types/WorkTaskType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- **ApprovalResult（审批流转结果 APPROVED/REJECTED，审批功能新增）**：
  - 后端：`constants/ApprovalResult.ts`、`models/ApprovalFlow.ts`、`constructors/ApprovalFlowDtoFactory.ts`、`repositories/ApprovalFlowRepository.ts`、`services/BerthApprovalService.ts`。
  - 前端：`constants/ApprovalResult.ts`、`types/ApprovalFlow.ts`、`components/common/ApprovalFlowPanel.ts`。
- **WorkTaskStatus（PENDING/IN_PROGRESS/COMPLETED/CANCELLED，审批开任务用 PENDING）**：后端 `constants/WorkTaskStatus.ts`、`constructors/WorkTaskDtoFactory.ts`。
- **审批角色常量 roles**：后端 `constants/roles.ts`（`APPROVE_ROLES`）、`middlewares/rbacMiddleware.ts`、`routes/BerthPlanRoutes.ts`、`services/BerthApprovalService.ts`；前端 `constants/roles.ts`、`stores/BerthPlanStore.ts`、`pages/BerthsPage.ts`（按钮显隐）。
- **审批错误码/错误消息**：`BERTH_PLAN_NOT_FOUND / BERTH_PLAN_ALREADY_APPROVED / BERTH_PLAN_NOT_APPROVABLE / BERTH_TIME_OVERLAP / YARD_SLOT_NOT_FOUND / YARD_SLOT_OCCUPIED / YARD_SLOT_LOCKED / RBAC_DENIED / VALIDATION_FAILED`。
  - 后端：`constants/errorCodes.ts`、`constants/errorMessages.ts`（带 `{slot}/{berth}/{plan}` 模板，由 `utils/formatters.ts#fillTemplate` 填充）、`services/BerthApprovalService.ts`、`middlewares/errorHandlerMiddleware.ts`。
  - 前端：`constants/errorCodes.ts`（含 `ERROR_CODE_TITLES` 归类）、`constants/errorMessages.ts`、`api/BerthPlan.ts`（`ApiError`）、`pages/BerthsPage.ts`、`components/common/ConflictBadge.ts`。
- **审批日志模板**：后端 `constants/logTemplates.ts` 的 `BerthPlan.approve.success/reject`、`YardSlot.occupy/release`、`WorkTask.dispatch`。

## 接口示例（审批）

```bash
# 审批：同时占用箱位 2、3 并各开一条卸船任务（一次保存）
curl -X POST http://localhost:21106/api/berth-plan/1/approve \
  -H "Content-Type: application/json" -H "x-role: DISPATCHER" -H "x-user-id: 7" \
  -d '{"yard_slot_ids":[2,3],"tasks":[{"yard_slot_id":2,"task_type":"DISCHARGE"},{"yard_slot_id":3,"task_type":"LOAD"}]}'

# 详情：最新流转结果 + 失败原因 + 已开任务
curl http://localhost:21106/api/berth-plan/1
```

失败响应统一为 `{"code":"...","message":"..."}`：泊位重叠 409、箱位占用 409、计划已审批 409、计划不存在/箱位不存在 404、参数错误 400、权限不足 403。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
