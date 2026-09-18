export const UserRole = ["DISPATCHER", "YARD_CLERK", "WORK_TEAM", "VIEWER"] as const;
export type UserRole = (typeof UserRole)[number];

export const DISPATCHER_ROLES: UserRole[] = ["DISPATCHER"];
