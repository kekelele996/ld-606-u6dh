export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

const FLOW_ACTION_TEXT: Record<string, string> = {
  SUBMIT_APPROVE: "提交审批",
  APPROVED: "审批通过",
  REJECTED: "审批拒绝"
};

export const formatFlowAction = (action: string) => FLOW_ACTION_TEXT[action] ?? action;

export const formatSlotCoordinate = (slot: { yard_area: string; row_no: string; bay_no: string; tier_no: string }) =>
  `${slot.yard_area}-${slot.row_no}-${slot.bay_no}-${slot.tier_no}`;
