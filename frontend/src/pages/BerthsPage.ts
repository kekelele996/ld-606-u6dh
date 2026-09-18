import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BerthPlanStore } from "../stores/BerthPlanStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { ConflictBadge } from "../components/common/ConflictBadge";
import { getIdentity, setIdentity } from "../api/client";
import { resolveApproveError } from "../constants/errorMessages";
import { formatDate, formatFlowAction, formatSlotCoordinate } from "../utils/formatters";
import type { ApprovePlanResult } from "../types/BerthPlan";
import type { PlanTransition } from "../types/BerthPlan";

const ROLE_OPTIONS = ["DISPATCHER", "YARD_CLERK", "WORK_TEAM", "VIEWER"] as const;

@Component({
  selector: "app-berths-page",
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadge, ConflictBadge],
  template: `
  <section class="page-head">
    <div><p class="eyebrow">port-yard / 泊位计划</p><h1>靠泊计划审批</h1>
      <p class="hint">审批通过后一次性占用指定箱位并开出装卸任务；泊位时段重叠、箱位已占用、权限不足将整次拒绝。</p>
    </div>
    <div class="role-switch">
      <label>当前身份</label>
      <select [ngModel]="role" (ngModelChange)="changeRole($event)">
        <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
      </select>
      <span class="badge">ID {{ userId }}</span>
    </div>
  </section>

  <section class="layout">
    <div class="panel plan-list">
      <h2>计划列表</h2>
      <table>
        <thead><tr><th>ID</th><th>泊位</th><th>时段</th><th>状态</th><th>版本</th></tr></thead>
        <tbody>
          <tr *ngFor="let p of store.rows()" [class.active]="p.id === selectedId()" (click)="select(p.id)">
            <td>#{{ p.id }}</td>
            <td>{{ berthCode(p.berth_id) }}</td>
            <td>{{ formatDate(p.planned_arrival) }}</td>
            <td><app-status-badge [status]="p.status"></app-status-badge></td>
            <td>v{{ p.version }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="panel detail" *ngIf="store.detail() as d">
      <div class="detail-head">
        <h2>计划 #{{ d.id }} 详情</h2>
        <app-status-badge [status]="d.status"></app-status-badge>
      </div>

      <!-- 最新流转结果 -->
      <div class="flow" *ngIf="d.latestTransition as t"
           [class.ok]="t.action === 'APPROVED'" [class.fail]="t.action === 'REJECTED'">
        <strong>最新流转：{{ flowText(t.action) }}</strong>
        <span>{{ formatDate(t.at) }} · 调度员 #{{ t.dispatcher_id }}</span>
        <app-conflict-badge *ngIf="t.action === 'REJECTED'" [conflict]="true" [reason]="failText(t)"></app-conflict-badge>
        <app-conflict-badge *ngIf="t.action === 'APPROVED'" [conflict]="false"></app-conflict-badge>
      </div>
      <div class="flow muted" *ngIf="!d.latestTransition">尚未提交过审批</div>

      <!-- 本次操作的即时结果 -->
      <div class="result ok" *ngIf="last()?.ok">
        ✔ 审批成功：箱位 {{ last()!.slotIds.join(', ') }} 已占用，装卸任务 {{ last()!.taskIds.join(', ') }} 已开出（版本 v{{ last()!.version }}）
      </div>
      <div class="result fail" *ngIf="last() && !last()!.ok && last()!.reason">
        ✘ 整次拒绝：{{ resolveErr(last()!.code, last()!.reason) }}（计划状态、箱位占用与任务均未改动）
      </div>
      <div class="result fail" *ngIf="store.pageError() && !last()">
        ✘ {{ store.pageError() }}
      </div>

      <div class="grid">
        <div><span>船舶</span><strong>#{{ d.vessel_id }}</strong></div>
        <div><span>泊位</span><strong>{{ berthCode(d.berth_id) }}</strong></div>
        <div><span>任务类型</span><strong>{{ d.task_type }}</strong></div>
        <div><span>优先级</span><strong>{{ d.priority }}</strong></div>
        <div><span>计划靠泊</span><strong>{{ formatDate(d.planned_arrival) }}</strong></div>
        <div><span>计划离泊</span><strong>{{ formatDate(d.planned_departure) }}</strong></div>
      </div>

      <h3>指定箱位（{{ d.slots.length }}）</h3>
      <table class="sub">
        <thead><tr><th>箱位</th><th>状态</th><th>占用计划</th></tr></thead>
        <tbody>
          <tr *ngFor="let s of d.slots">
            <td>{{ coord(s) }}</td>
            <td><app-status-badge [status]="s.slot_status"></app-status-badge></td>
            <td>{{ s.held_by_plan_id ? ('#' + s.held_by_plan_id) : '—' }}</td>
          </tr>
        </tbody>
      </table>

      <h3>装卸任务（{{ d.tasks.length }}）</h3>
      <table class="sub" *ngIf="d.tasks.length; else noTasks">
        <thead><tr><th>任务ID</th><th>箱位</th><th>类型</th><th>状态</th><th>计划开始</th></tr></thead>
        <tbody>
          <tr *ngFor="let tk of d.tasks">
            <td>#{{ tk.id }}</td><td>{{ tk.yard_slot_id }}</td><td>{{ tk.task_type }}</td>
            <td><app-status-badge [status]="tk.status"></app-status-badge></td>
            <td>{{ formatDate(tk.planned_start) }}</td>
          </tr>
        </tbody>
      </table>
      <ng-template #noTasks><p class="empty">暂无任务（审批通过后自动开出）</p></ng-template>

      <h3>流转历史</h3>
      <ul class="history">
        <li *ngFor="let t of d.transitions">
          <span class="dot" [attr.data-action]="t.action"></span>
          {{ formatDate(t.at) }} · {{ flowText(t.action) }} · 调度员 #{{ t.dispatcher_id }}
          <em *ngIf="t.action === 'REJECTED'">（{{ resolveErr(t.code, t.reason) }}）</em>
        </li>
        <li *ngIf="!d.transitions.length" class="empty">无流转记录</li>
      </ul>

      <div class="actions">
        <button class="primary" [disabled]="store.approving() || !approvable(d.status)"
                (click)="approve(d.id, d.version)">
          {{ store.approving() ? "审批提交中…" : "审批通过（占箱位 + 开任务）" }}
        </button>
        <span class="lock">乐观版本 v{{ d.version }} · 并发时仅一份成功</span>
      </div>
    </div>
    <div class="panel detail" *ngIf="!store.detail() && !store.loading()">
      <p class="empty">请从左侧选择一份靠泊计划</p>
    </div>
  </section>`,
  styles: [`
    .page-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
    .hint{color:#667;margin:4px 0 0}
    .role-switch{display:flex;align-items:center;gap:8px}
    .role-switch select{padding:6px 10px;border:1px solid #ccd;border-radius:8px}
    .layout{display:grid;grid-template-columns:380px 1fr;gap:16px}
    .panel{background:#fff;border:1px solid #e6e8ee;border-radius:12px;padding:16px}
    .plan-list table{width:100%;border-collapse:collapse;font-size:13px}
    .plan-list th,.plan-list td{text-align:left;padding:8px;border-bottom:1px solid #f0f1f5}
    .plan-list tbody tr{cursor:pointer}
    .plan-list tbody tr:hover{background:#f7f9ff}
    .plan-list tbody tr.active{background:#eaf1ff}
    .detail-head{display:flex;justify-content:space-between;align-items:center}
    .flow,.result{border-radius:10px;padding:10px 12px;margin:10px 0;font-size:13px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .flow.ok,.result.ok{background:#e9f8ee;color:#1a7f37;border:1px solid #b6e3c2}
    .flow.fail,.result.fail{background:#fdeeee;color:#b42318;border:1px solid #f3c2c2}
    .flow.muted{background:#f5f6f9;color:#778}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}
    .grid div{background:#f7f8fb;border-radius:8px;padding:8px 10px;display:flex;flex-direction:column}
    .grid span{font-size:12px;color:#889}
    .sub{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px}
    .sub th,.sub td{text-align:left;padding:6px 8px;border-bottom:1px solid #f0f1f5}
    .history{list-style:none;padding:0;margin:0 0 12px;font-size:13px;color:#445}
    .history li{padding:6px 0;border-bottom:1px dashed #eee;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .history em{color:#b42318;font-style:normal}
    .dot{width:8px;height:8px;border-radius:50%;background:#99a}
    .dot[data-action="APPROVED"]{background:#1a7f37}
    .dot[data-action="REJECTED"]{background:#c02d2d}
    .actions{display:flex;align-items:center;gap:12px;margin-top:8px}
    button.primary{background:#1d56c4;color:#fff;border:0;border-radius:10px;padding:10px 18px;font-size:14px;cursor:pointer}
    button.primary:disabled{background:#9bb4e0;cursor:not-allowed}
    .lock{color:#889;font-size:12px}
    .empty{color:#99a;font-size:13px}
    .badge{background:#eef1f5;border-radius:999px;padding:2px 10px;font-size:12px}
  `]
})
export class BerthsPage implements OnInit {
  readonly store = inject(BerthPlanStore);
  readonly roles = ROLE_OPTIONS;
  readonly selectedId = signal<number>(1);
  role = getIdentity().role;
  userId = getIdentity().userId;

  private autoSelected = false;

  async ngOnInit(): Promise<void> {
    await this.store.loadList();
    if (!this.autoSelected && this.store.rows().length) {
      this.autoSelected = true;
      await this.select(this.store.rows()[0].id);
    }
  }

  formatDate = formatDate;
  flowText = formatFlowAction;
  coord = formatSlotCoordinate;
  resolveErr = resolveApproveError;

  berthCode(id: number): string {
    return `B-${String(id).padStart(2, "0")}`;
  }

  last(): ApprovePlanResult | null {
    return this.store.lastResult();
  }

  approvable(status: string): boolean {
    return status === "DRAFT" || status === "CONFLICT";
  }

  failText(t: PlanTransition): string {
    return resolveApproveError(t.code, t.reason);
  }

  async select(id: number): Promise<void> {
    this.selectedId.set(id);
    this.store.lastResult.set(null);
    await this.store.loadDetail(id);
  }

  changeRole(role: string): void {
    setIdentity(role, this.userId);
    this.role = getIdentity().role;
  }

  async approve(id: number, version: number): Promise<void> {
    await this.store.approve(id, version);
  }
}
