/**
 * 审批靠泊计划请求体：
 * - yard_slot_ids: 本次同时占用的指定堆场箱位
 * - tasks: 每个箱位开出的装卸任务（可选，默认整船卸船 DISCHARGE）
 * - dispatcher_id: 审批调度员（一般由鉴权中间件注入，可缺省）
 */
export interface ApproveTaskPayload {
  yard_slot_id: number;
  task_type?: string;
  team_id?: number;
  planned_start?: string;
}

export interface ApproveBerthPlanPayload {
  yard_slot_ids?: number[];
  slots?: number[]; // 兼容简写
  tasks?: ApproveTaskPayload[];
  dispatcher_id?: number;
  team_id?: number;
}

export type BerthPlanPayload = Record<string, unknown>;
