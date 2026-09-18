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
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


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

## 靠泊计划审批事务（核心业务规则）

`POST /api/berth-plan/:id/approve`（仅 `DISPATCHER` 角色，前端「泊位计划」详情页触发）一次完成三项受控变更：

1. 计划状态 `DRAFT/CONFLICT → APPROVED`（记录审批调度员与流转记录）；
2. 占用计划指定的堆场箱位：`slot_status=OCCUPIED`、`held_by_plan_id=计划ID`；
3. 按计划 `task_type` 为每个箱位开出一份 `PENDING` 装卸任务（WorkTask）。

规则与并发保证：

- **一次保存**：三项变更在同一事务（后端 `repositories/db.ts` 的写互斥队列 + 快照原子提交；生产 MySQL 对应单事务 + `SELECT ... FOR UPDATE`）。任一前置校验失败即整体丢弃快照，状态、箱位、任务三项保持原样。
- **一箱位一份计划**：箱位在被释放（`held_by_plan_id` 回到 `NULL`）前只能被一份已审批计划持有。
- **整次拒绝的场景**：泊位时段与其他已审批/靠泊中计划重叠（半开区间 `[到,离)`，边界相接允许）、指定箱位已占用或锁定、调度权限不足（路由级 RBAC，403）、计划状态不可审批。
- **并发只一份成功**：`berth_plan.version` 乐观锁 CAS + 写互斥；两个调度员同时审批同一份/冲突计划，只有一个成功，另一个返回 `APPROVE_CONCURRENT_CONFLICT`。
- **失败原因可见**：拒绝时把 `code` 与具体原因写入计划 `reject_reason` 和 `berth_plan_transition`（不改三项受控资源）；详情页展示「最新流转结果」「失败原因」「占用箱位」「装卸任务」与完整流转历史。

涉及文件：`services/approvePlanService.ts`、`services/berthConflictService.ts`、`services/yardAllocationService.ts`、`repositories/db.ts`、`repositories/{BerthPlan,YardSlot,WorkTask,AuditLog}Repository.ts`、`controllers/BerthPlanController.ts`、`routes/BerthPlanRoutes.ts`、`middlewares/{auth,rbac}Middleware.ts`、`constants/{errorCodes,errorMessages,logTemplates,UserRole,WorkTaskStatus}.ts`、`constructors/BerthPlanDtoFactory.ts`，前端 `pages/BerthsPage.ts`、`stores/BerthPlanStore.ts`、`api/{client,BerthPlan}.ts`、`components/common/{StatusBadge,ConflictBadge}.ts`。

## 枚举/常量出现位置清单

- BerthPlanStatus: `backend/src/constants/BerthPlanStatus.ts`、types/models/BerthPlan、constructors/BerthPlanDtoFactory、logTemplates（审批模板）、errorMessages、berthConflictService、approvePlanService、前端 `constants/BerthPlanStatus.ts`、types/BerthPlan、constructors、StatusBadge、BerthsPage 筛选/展示。
- YardSlotStatus: 后端 constants/YardSlotStatus、models/YardSlot、seed、yardAllocationService、YardSlotDtoFactory、logTemplates、errorMessages、前端 constants/YardSlotStatus、types/YardSlot、YardGrid/StatusBadge、堆场页。
- WorkTaskType: 后端 constants/WorkTaskType、models/WorkTask、seed、approvePlanService、WorkTaskDtoFactory、前端 constants/WorkTaskType、types/WorkTask、TasksPage、TeamTag。
- 审批相关错误码（前后端各一份）：`BERTH_PLAN_NOT_FOUND / BERTH_PLAN_NOT_APPROVABLE / BERTH_TIME_OVERLAP / YARD_SLOT_NOT_FOUND / YARD_SLOT_OCCUPIED / YARD_SLOT_LOCKED / APPROVE_CONCURRENT_CONFLICT / RBAC_DENIED`，集中在 `constants/errorCodes.ts` 与 `constants/errorMessages.ts`，被 service、controller、store、详情页共同引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
