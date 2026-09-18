import { Injectable, signal } from "@angular/core";
import { approveBerthPlan, getBerthPlanDetail, listBerthPlan } from "../api/BerthPlan";
import { ERROR_MESSAGES, resolveApproveError } from "../constants/errorMessages";
import type { ApprovePlanResult, BerthPlan, BerthPlanDetail } from "../types/BerthPlan";
import { createEmptyApproveResult } from "../constructors/BerthPlanConstructor";

/**
 * Approval flow store. The detail page always re-fetches after an attempt so
 * the latest transition + reject reason reflect the backend's single source
 * of truth (important when two dispatchers act concurrently).
 */
@Injectable({ providedIn: "root" })
export class BerthPlanStore {
  readonly rows = signal<BerthPlan[]>([]);
  readonly detail = signal<BerthPlanDetail | null>(null);
  readonly loading = signal(false);
  readonly approving = signal(false);
  readonly lastResult = signal<ApprovePlanResult | null>(null);
  /** Local display error, e.g. 403 RBAC denied or network failure. */
  readonly pageError = signal<string | null>(null);

  async loadList(): Promise<void> {
    this.rows.set(await listBerthPlan());
  }

  async loadDetail(id: number): Promise<void> {
    this.loading.set(true);
    this.pageError.set(null);
    try {
      this.detail.set(await getBerthPlanDetail(id));
    } catch (error) {
      this.pageError.set((error as Error).message ?? ERROR_MESSAGES.VALIDATION_FAILED);
    } finally {
      this.loading.set(false);
    }
  }

  async approve(id: number, expectedVersion: number): Promise<ApprovePlanResult> {
    this.approving.set(true);
    this.pageError.set(null);
    try {
      const result = await approveBerthPlan(id, { expectedVersion });
      this.lastResult.set(result);
      // 业务拒绝（409 ok:false）→ 用后端持久化的 reason 展示
      if (!result.ok) {
        this.pageError.set(resolveApproveError(result.code, result.reason));
      }
      // 无论成败都刷新详情：展示最新流转结果、箱位占用与任务
      await this.loadDetail(id);
      await this.loadList();
      return result;
    } catch (error) {
      const e = error as { code?: string; status?: number; message?: string };
      const text =
        e.status === 403
          ? ERROR_MESSAGES.RBAC_DENIED
          : resolveApproveError(e.code, e.message);
      this.pageError.set(text);
      this.lastResult.set({ ...createEmptyApproveResult(id), ok: false, reason: text, code: e.code });
      return this.lastResult()!;
    } finally {
      this.approving.set(false);
    }
  }
}
