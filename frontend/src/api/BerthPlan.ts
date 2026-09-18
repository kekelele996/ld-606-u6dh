import { mockData } from "../mocks/seedData";
import type { BerthPlan } from "../types/BerthPlan";
import type { ApproveBerthPlanRequest, BerthPlanDetail } from "../types/BerthPlanDetail";

const endpoint = "/api/berth-plan";

export interface ApiErrorBody {
  code: string;
  message: string;
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(body: ApiErrorBody, status: number) {
    super(body.message);
    this.code = body.code;
    this.status = status;
  }
}

const parseError = async (res: Response): Promise<ApiError> => {
  let body: ApiErrorBody = { code: "INTERNAL_ERROR", message: "服务暂时不可用" };
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // 保持默认错误体
  }
  return new ApiError(body, res.status);
};

export async function listBerthPlan(): Promise<BerthPlan[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return (await res.json()) as BerthPlan[];
    throw await parseError(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // 离线评审时回退到本地种子，保证界面可用
    return [...(mockData.berthPlan as unknown as BerthPlan[])];
  }
}

/** 详情页：计划 + 最新流转结果（含失败原因）+ 已开任务。 */
export async function getBerthPlanDetail(id: number): Promise<BerthPlanDetail> {
  const res = await fetch(`${endpoint}/${id}`);
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as BerthPlanDetail;
}

/**
 * 审批靠泊计划：同时占用指定箱位并开出装卸任务，后端一次保存。
 * 失败（泊位重叠 / 箱位占用 / 权限不足 / 并发落败）时抛出带错误码的 ApiError。
 */
export async function approveBerthPlan(
  id: number,
  payload: ApproveBerthPlanRequest,
  role: string
): Promise<BerthPlanDetail> {
  const res = await fetch(`${endpoint}/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-role": role },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw await parseError(res);
  // 审批成功后立即拉取详情，保证「最新流转结果」
  return getBerthPlanDetail(id);
}

export async function saveBerthPlan(payload: BerthPlan) {
  console.info("save BerthPlan", payload);
  return payload;
}
