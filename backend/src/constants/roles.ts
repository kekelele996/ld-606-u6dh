/** 系统角色：调度 / 堆场员 / 作业队 / 只读客户 / 管理员。审批仅 DISPATCHER、ADMIN 可执行。 */
export const Roles = ["ADMIN", "DISPATCHER", "YARD_CLERK", "WORK_TEAM", "READONLY_CLIENT"] as const;
export type Role = (typeof Roles)[number];

export const APPROVE_ROLES: Role[] = ["DISPATCHER", "ADMIN"];
