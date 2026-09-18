import { Injectable, signal } from "@angular/core";
import type { BerthPlan } from "../types/BerthPlan";
import type { BerthPlanDetail, ApproveBerthPlanRequest } from "../types/BerthPlanDetail";
import { listBerthPlan, getBerthPlanDetail, approveBerthPlan, ApiError } from "../api/BerthPlan";

/**
 * 靠泊计划 store：列表 + 当前详情 + 审批动作。
 * 审批由后端原子完成；无论成功失败都刷新详情，让「最新流转结果 + 失败原因」可见。
 */
@Injectable({ providedIn: "root" })
export class BerthPlanStore {
  readonly rows = signal<BerthPlan[]>([]);
  readonly detail = signal<BerthPlanDetail | null>(null);
  readonly loading = signal(false);
  readonly approving = signal(false);
  /** 最近一次审批失败（详情页失败原因区 + 按钮区共用）。 */
  readonly approveError = signal<ApiError | null>(null);
  readonly currentRole = signal("DISPATCHER");

  async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await listBerthPlan());
    } finally {
      this.loading.set(false);
    }
  }

  async loadDetail(id: number): Promise<void> {
    this.detail.set(await getBerthPlanDetail(id));
    this.approveError.set(null);
  }

  /**
   * 审批：后端在一个事务里同时写 状态/箱位占用/任务。
   * 成功或失败都拉详情；失败时把 ApiError 抛出供页面同时读取。
   */
  async approve(id: number, payload: ApproveBerthPlanRequest): Promise<boolean> {
    this.approving.set(true);
    this.approveError.set(null);
    try {
      this.detail.set(await approveBerthPlan(id, payload, this.currentRole()));
      await this.loadList();
      return true;
    } catch (error) {
      this.approveError.set(error instanceof ApiError ? error : null);
      // 失败也刷新详情：后端已写入 REJECTED 流转（含失败原因）
      try {
        this.detail.set(await getBerthPlanDetail(id));
      } catch {
        // 详情拉取失败时保留 approveError 即可
      }
      await this.loadList();
      return false;
    } finally {
      this.approving.set(false);
    }
  }
}
