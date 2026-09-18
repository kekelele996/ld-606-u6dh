export const UserRoles = ["ADMIN", "DISPATCHER", "YARD_CLERK", "WORK_TEAM", "READONLY_CLIENT"] as const;
export type UserRole = (typeof UserRoles)[number];

export const UserRoleText: Record<UserRole, string> = {
  ADMIN: "管理员",
  DISPATCHER: "调度员",
  YARD_CLERK: "堆场员",
  WORK_TEAM: "作业队",
  READONLY_CLIENT: "只读客户"
};

/** 可执行审批的角色（按钮显隐 + 后端 RBAC 双重控制）。 */
export const CAN_APPROVE_ROLES: UserRole[] = ["ADMIN", "DISPATCHER"];
