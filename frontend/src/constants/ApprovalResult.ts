export const ApprovalResult = ["APPROVED", "REJECTED"] as const;
export type ApprovalResult = (typeof ApprovalResult)[number];
export const ApprovalResultText: Record<ApprovalResult, string> = {
  APPROVED: "审批通过",
  REJECTED: "审批拒绝"
};
