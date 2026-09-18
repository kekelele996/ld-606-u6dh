export const ApprovalResult = ["APPROVED", "REJECTED"] as const;
export type ApprovalResult = (typeof ApprovalResult)[number];
