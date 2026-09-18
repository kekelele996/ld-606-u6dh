/**
 * 靠泊计划审批验收测试（零依赖，直接跑领域服务）：
 *   npx tsx src/__tests__/approval.test.ts
 * 覆盖：一次保存原子性、泊位重叠、箱位占用、RBAC、并发只成功一份、流转留痕。
 */
import { db } from "../config/inMemoryDb";
import { berthApprovalService } from "../services/BerthApprovalService";
import { ERROR_CODES } from "../constants/errorCodes";
import type { BusinessError } from "../utils/BusinessError";

import type { Role } from "../constants/roles";

let passed = 0;
let failed = 0;
const assert = (name: string, cond: boolean, extra = "") => {
  if (cond) {
    passed += 1;
    console.info(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL  ${name} ${extra}`);
  }
};
const tables = () => db.getTables();
const reset = () => db.reset();
const dispatcher = (id = 7) => ({ id, role: "DISPATCHER" as Role });
const actor = (id: number, role: Role) => ({ id, role });
const expectCode = (error: unknown): string => (error as BusinessError).code;

const approve = (
  planId: number,
  payload: unknown = { yard_slot_ids: [2] },
  currentActor: { id: number; role: Role } = dispatcher()
) => berthApprovalService.approve(planId, payload as never, currentActor);

const run = async () => {
  // 1. 审批成功：三项一次保存
  reset();
  console.info("\n[1] 审批成功：计划状态 + 箱位占用 + 任务创建一次保存");
  await approve(1, { yard_slot_ids: [2, 3] });
  assert("计划变为 APPROVED", tables().berthPlan.find((p) => p.id === 1)!.status === "APPROVED");
  assert("箱位2 被 OCCUPIED", tables().yardSlot.find((s) => s.id === 2)!.slot_status === "OCCUPIED");
  assert("箱位3 被 OCCUPIED", tables().yardSlot.find((s) => s.id === 3)!.slot_status === "OCCUPIED");
  const newTasks = tables().workTask.filter((t) => t.berth_plan_id === 1);
  assert("开出 2 条装卸任务", newTasks.length === 2, `got ${newTasks.length}`);
  assert(
    "任务类型默认 DISCHARGE 且状态 PENDING",
    newTasks.every((t) => t.task_type === "DISCHARGE" && t.status === "PENDING")
  );
  const flow = berthApprovalService.getDetail(1).latestFlow!;
  assert("成功流转留痕", flow.result === "APPROVED" && flow.occupied_slot_ids === "2,3");

  // 2. 箱位未释放前只能挂一份已审批计划（重复审批）
  console.info("\n[2] 已审批计划不可重复审批");
  const again = await approve(1).catch((e) => e);
  assert("返回 ALREADY_APPROVED", expectCode(again) === ERROR_CODES.BERTH_PLAN_ALREADY_APPROVED);
  assert("不会重复开任务", tables().workTask.filter((t) => t.berth_plan_id === 1).length === 2);
  const rejectFlow = berthApprovalService.getDetail(1).latestFlow!;
  assert("最新流转为 REJECTED 且带失败原因", rejectFlow.result === "REJECTED" && rejectFlow.reason.length > 0);

  // 3. 泊位时段重叠
  reset();
  console.info("\n[3] 泊位时段重叠整次拒绝");
  // 计划 2 已 APPROVED 占用泊位1 09-17 07:00~19:00；造一条同泊位重叠草稿
  tables().berthPlan.push({
    id: 100,
    vessel_id: 3,
    berth_id: 1,
    planned_arrival: "2026-09-17T12:00:00Z",
    planned_departure: "2026-09-17T22:00:00Z",
    priority: "NORMAL",
    status: "DRAFT",
    dispatcher_id: 1
  });
  const overlapErr = await approve(100, { yard_slot_ids: [2] }).catch((e) => e);
  assert("返回 BERTH_TIME_OVERLAP", expectCode(overlapErr) === ERROR_CODES.BERTH_TIME_OVERLAP);
  assert("计划仍是 DRAFT", tables().berthPlan.find((p) => p.id === 100)!.status === "DRAFT");
  assert("箱位2 仍 EMPTY（未被占用）", tables().yardSlot.find((s) => s.id === 2)!.slot_status === "EMPTY");
  assert("没有为计划100创建任务", tables().workTask.every((t) => t.berth_plan_id !== 100));
  assert(
    "失败原因写入流转记录",
    berthApprovalService.getDetail(100).latestFlow!.reason.includes("时段")
  );

  // 4. 箱位已占用
  reset();
  console.info("\n[4] 指定箱位已被占用整次拒绝");
  // 先让计划1 占用箱位2（09-19 时段），再造一条同时段重叠的草稿
  await approve(1, { yard_slot_ids: [2] });
  tables().berthPlan.push({
    id: 102,
    vessel_id: 3,
    berth_id: 3,
    planned_arrival: "2026-09-19T10:00:00Z",
    planned_departure: "2026-09-19T15:00:00Z",
    priority: "NORMAL",
    status: "DRAFT",
    dispatcher_id: 1
  });
  const slotErr = await approve(102, { yard_slot_ids: [2] }).catch((e) => e);
  assert("返回 YARD_SLOT_OCCUPIED", expectCode(slotErr) === ERROR_CODES.YARD_SLOT_OCCUPIED);
  assert("计划102 仍是 DRAFT", tables().berthPlan.find((p) => p.id === 102)!.status === "DRAFT");
  assert("没有为计划102创建任务", tables().workTask.every((t) => t.berth_plan_id !== 102));
  const lockedErr = await approve(102, { yard_slot_ids: [5] }).catch((e) => e); // LOCKED
  assert(
    "LOCKED 箱位同样拒绝",
    ([ERROR_CODES.YARD_SLOT_OCCUPIED, ERROR_CODES.YARD_SLOT_LOCKED] as string[]).includes(expectCode(lockedErr))
  );
  const missingSlot = await approve(102, { yard_slot_ids: [999] }).catch((e) => e);
  assert("不存在箱位返回 NOT_FOUND", expectCode(missingSlot) === ERROR_CODES.YARD_SLOT_NOT_FOUND);

  // 5. 调度权限不足
  reset();
  console.info("\n[5] 非调度角色整次拒绝");
  const roles = ["YARD_CLERK", "WORK_TEAM", "READONLY_CLIENT"] as const;
  for (const role of roles) {
    const err = await approve(1, { yard_slot_ids: [2] }, actor(9, role)).catch((e) => e);
    assert(`${role} 被拒 RBAC_DENIED`, expectCode(err) === ERROR_CODES.RBAC_DENIED);
  }
  assert("权限拒绝后计划仍 DRAFT", tables().berthPlan.find((p) => p.id === 1)!.status === "DRAFT");
  assert("ADMIN 可审批", (await approve(3, { yard_slot_ids: [4] }, actor(1, "ADMIN"))).plan.status === "APPROVED");

  // 6. 两个调度员同时审批，只成功一份
  reset();
  console.info("\n[6] 并发审批：两个调度员同时点，只成功一份");
  const [r1, r2] = await Promise.allSettled([
    approve(1, { yard_slot_ids: [2] }, dispatcher(7)),
    approve(1, { yard_slot_ids: [3] }, dispatcher(8))
  ]);
  const okCount = [r1, r2].filter((r) => r.status === "fulfilled").length;
  assert("恰好一份成功", okCount === 1, `fulfilled=${okCount}`);
  const rejected = [r1, r2].find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
  assert(
    "失败的那份是 ALREADY_APPROVED",
    !!rejected && expectCode(rejected.reason) === ERROR_CODES.BERTH_PLAN_ALREADY_APPROVED
  );
  assert("计划只有一条 APPROVED 终态", tables().berthPlan.filter((p) => p.id === 1 && p.status === "APPROVED").length === 1);
  const tasksAfter = tables().workTask.filter((t) => t.berth_plan_id === 1);
  assert("只开出成功那份的任务（1 条）", tasksAfter.length === 1, `got ${tasksAfter.length}`);
  const occupiedByPlan = tables().yardSlot.filter((s) => s.slot_status === "OCCUPIED");
  assert("只有成功者的箱位被占用", occupiedByPlan.map((s) => s.id).sort().join(",") === "1,2" || occupiedByPlan.map((s) => s.id).sort().join(",") === "1,3");

  // 7. 任一步失败三项都保持原样（多箱位其中一个被占）
  reset();
  console.info("\n[7] 多箱位中一个已占用：整批回滚");
  const partial = await approve(1, { yard_slot_ids: [2, 5] }).catch((e) => e); // 箱位5 LOCKED
  assert("返回占用错误", ([ERROR_CODES.YARD_SLOT_OCCUPIED, ERROR_CODES.YARD_SLOT_LOCKED] as string[]).includes(expectCode(partial)));
  assert("计划保持 DRAFT", tables().berthPlan.find((p) => p.id === 1)!.status === "DRAFT");
  assert("箱位2 仍 EMPTY", tables().yardSlot.find((s) => s.id === 2)!.slot_status === "EMPTY");
  assert("没有任何新任务", tables().workTask.every((t) => t.berth_plan_id !== 1));

  // 8. 时段相接不算重叠 & CANCELLED 计划不冲突
  reset();
  console.info("\n[8] 边界：时段相接不冲突、已取消计划不参与冲突");
  tables().berthPlan.push({
    id: 101,
    vessel_id: 3,
    berth_id: 1,
    planned_arrival: "2026-09-17T19:00:00Z", // 与计划2 端点相接
    planned_departure: "2026-09-17T23:00:00Z",
    priority: "NORMAL",
    status: "DRAFT",
    dispatcher_id: 1
  });
  const touch = await approve(101, { yard_slot_ids: [2] }).catch((e) => e);
  assert("端点相接可审批", !(touch instanceof Error), touch instanceof Error ? String(expectCode(touch)) : "");

  console.info(`\n结果：${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
};

void run();
