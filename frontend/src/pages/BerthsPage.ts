import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BerthPlanStore } from "../stores/BerthPlanStore";
import { YardSlotStore } from "../stores/YardSlotStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { BerthTimeline } from "../components/common/BerthTimeline";
import { ConflictBadge } from "../components/common/ConflictBadge";
import { TeamTag } from "../components/common/TeamTag";
import { ApprovalFlowPanel } from "../components/common/ApprovalFlowPanel";
import { useBerthConflict } from "../hooks/useBerthConflict";
import { formatDateTime } from "../utils/formatters";
import { UserRoles, UserRoleText, CAN_APPROVE_ROLES, type UserRole } from "../constants/roles";

/**
 * 泊位计划页：
 * - 左侧计划列表（含冲突标记），点击进入详情
 * - 右侧详情：基本信息 + 装卸任务 + 审批面板（占用箱位多选 + 审批按钮）
 * - 失败原因 / 最新流转结果由 ApprovalFlowPanel 展示
 * - 顶部可切换当前角色，验证「调度权限不足」时按钮隐藏与后端 403
 */
@Component({
  selector: "app-berths-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadge,
    BerthTimeline,
    ConflictBadge,
    TeamTag,
    ApprovalFlowPanel
  ],
  template: `
    <section class="page-head">
      <div>
        <p class="eyebrow">berth plan approval</p>
        <h1>泊位计划 · 靠泊审批</h1>
      </div>
      <label class="role-switch">
        当前角色
        <select [ngModel]="store.currentRole()" (ngModelChange)="onRoleChange($event)">
          <option *ngFor="let role of roles" [value]="role">{{ roleText[role] }}</option>
        </select>
      </label>
    </section>

    <section class="metrics">
      <div class="stat"><span>计划总数</span><strong>{{ store.rows().length }}</strong></div>
      <div class="stat"><span>已审批</span><strong>{{ approvedCount }}</strong></div>
      <div class="stat"><span>待处理 / 冲突</span><strong>{{ pendingCount }} / {{ conflict.total }}</strong></div>
    </section>

    <app-berth-timeline [plans]="store.rows()"></app-berth-timeline>

    <section class="workbench">
      <div class="panel wide">
        <h2>靠泊计划列表</h2>
        <article
          class="row plan-row"
          *ngFor="let plan of store.rows()"
          [class.selected]="store.detail()?.plan?.id === plan.id"
          (click)="select(plan.id)"
        >
          <div class="plan-main">
            <strong>#{{ plan.id }} · 船舶 {{ plan.vessel_id }} → 泊位 {{ plan.berth_id }}</strong>
            <span class="time">{{ formatDateTime(plan.planned_arrival) }} ~ {{ formatDateTime(plan.planned_departure) }}</span>
          </div>
          <app-conflict-badge *ngIf="conflict.hasConflict(plan.id)" kind="BERTH_TIME_OVERLAP"></app-conflict-badge>
          <app-status-badge [text]="plan.status" [tone]="plan.status.toLowerCase()"></app-status-badge>
        </article>
        <p class="hint" *ngIf="store.rows().length === 0 && !store.loading()">暂无计划</p>
      </div>

      <div class="panel detail" *ngIf="detail() as d">
        <h2>计划 #{{ d.plan.id }} 详情</h2>
        <dl class="meta">
          <div><dt>船舶 / 泊位</dt><dd>#{{ d.plan.vessel_id }} / #{{ d.plan.berth_id }}</dd></div>
          <div><dt>计划时段</dt><dd>{{ formatDateTime(d.plan.planned_arrival) }} 起</dd></div>
          <div><dt>优先级</dt><dd>{{ d.plan.priority }}</dd></div>
          <div><dt>当前状态</dt><dd><app-status-badge [text]="d.plan.status" [tone]="d.plan.status.toLowerCase()"></app-status-badge></dd></div>
        </dl>

        <div class="tasks" *ngIf="d.tasks.length">
          <h3>已开装卸任务</h3>
          <div class="task" *ngFor="let task of d.tasks">
            <app-status-badge [text]="task.task_type"></app-status-badge>
            <span>箱位 #{{ task.yard_slot_id }}</span>
            <app-team-tag [teamId]="task.team_id"></app-team-tag>
            <app-status-badge [text]="task.status" [tone]="task.status.toLowerCase()"></app-status-badge>
          </div>
        </div>

        <div class="approve-box" *ngIf="canApprove()">
          <h3>审批并占用箱位</h3>
          <p class="hint">勾选本次同时占用的堆场箱位，提交后状态、箱位占用、装卸任务一次保存。</p>
          <div class="slot-picker">
            <label *ngFor="let slot of yard.available()">
              <input
                type="checkbox"
                [value]="slot.id"
                [checked]="selectedSlotIds.has(slot.id)"
                (change)="toggleSlot(slot.id, $event)"
              />
              #{{ slot.id }} {{ slot.yard_area }}-{{ slot.row_no }}-{{ slot.bay_no }}
              <small>({{ slot.cargo_type }})</small>
            </label>
            <p class="hint" *ngIf="yard.available().length === 0">暂无空闲箱位</p>
          </div>
          <button class="primary" [disabled]="store.approving() || selectedSlotIds.size === 0" (click)="submit(d.plan.id)">
            {{ store.approving() ? "审批中…" : "审批通过（占用箱位并开任务）" }}
          </button>
          <div class="inline-error" *ngIf="store.approveError() as err">
            <app-conflict-badge [kind]="badgeKind(err.code)"></app-conflict-badge>
            <span>{{ err.message }}</span>
          </div>
        </div>
        <div class="no-perm" *ngIf="!canApprove()">
          <app-conflict-badge kind="RBAC_DENIED"></app-conflict-badge>
          <span>当前角色（{{ currentRoleName() }}）无调度审批权限</span>
        </div>

        <app-approval-flow-panel [flows]="d.flows"></app-approval-flow-panel>
      </div>

      <div class="panel" *ngIf="!detail()">
        <h2>计划详情</h2>
        <p class="hint">点击左侧计划查看详情、占用箱位并审批。</p>
      </div>
    </section>
  `,
  styles: [
    `
      .role-switch {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #596257;
      }
      select {
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid #c9c3b2;
        background: #fbfaf4;
      }
      .plan-row {
        cursor: pointer;
        grid-template-columns: 1fr auto auto;
      }
      .plan-row.selected {
        background: #f3f0e2;
        border-radius: 6px;
      }
      .plan-main {
        display: grid;
        gap: 2px;
      }
      .plan-main .time {
        color: #777;
        font-size: 12px;
      }
      .detail {
        display: grid;
        gap: 14px;
        align-content: start;
      }
      .meta {
        display: grid;
        gap: 8px;
        margin: 0;
      }
      .meta div {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
      }
      dt {
        color: #777;
      }
      .task {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        padding: 6px 0;
        border-top: 1px dashed #ddd8c8;
      }
      .approve-box,
      .no-perm {
        border-top: 2px solid #d39b46;
        padding-top: 12px;
      }
      .slot-picker {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin: 8px 0 12px;
      }
      .slot-picker label {
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 4px;
        background: #f4f2e8;
        padding: 6px 8px;
        border-radius: 6px;
      }
      .slot-picker small {
        color: #888;
      }
      button.primary {
        width: 100%;
        background: #274335;
        color: #f5f1e6;
        border-radius: 6px;
        padding: 10px;
        font-weight: 700;
      }
      button.primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .inline-error {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        color: #8a2b20;
        font-size: 13px;
        flex-wrap: wrap;
      }
      .no-perm {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #8a2b20;
        font-size: 13px;
      }
      .hint {
        color: #777;
        font-size: 12px;
      }
    `
  ]
})
export class BerthsPage implements OnInit {
  readonly store = inject(BerthPlanStore);
  readonly yard = inject(YardSlotStore);
  readonly roles = UserRoles;
  readonly roleText = UserRoleText;
  readonly formatDateTime = formatDateTime;

  selectedSlotIds = new Set<number>();

  ngOnInit(): void {
    void this.store.loadList();
    void this.yard.loadList();
  }

  get detail() {
    return this.store.detail;
  }

  get approvedCount(): number {
    return this.store.rows().filter((p) => ["APPROVED", "BERTHING"].includes(p.status)).length;
  }

  get pendingCount(): number {
    return this.store.rows().filter((p) => ["DRAFT", "CONFLICT"].includes(p.status)).length;
  }

  get conflict() {
    return useBerthConflict(this.store.rows());
  }

  canApprove(): boolean {
    return CAN_APPROVE_ROLES.includes(this.store.currentRole() as UserRole);
  }

  onRoleChange(role: UserRole): void {
    this.store.currentRole.set(role);
  }

  currentRoleName(): string {
    return this.roleText[this.store.currentRole() as UserRole] ?? this.store.currentRole();
  }

  select(id: number): void {
    this.selectedSlotIds.clear();
    void this.store.loadDetail(id);
  }

  toggleSlot(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectedSlotIds.add(id);
    else this.selectedSlotIds.delete(id);
  }

  badgeKind(code: string): "BERTH_TIME_OVERLAP" | "YARD_SLOT_OCCUPIED" | "YARD_SLOT_LOCKED" | "RBAC_DENIED" | "" {
    if (code === "BERTH_TIME_OVERLAP") return "BERTH_TIME_OVERLAP";
    if (code === "YARD_SLOT_OCCUPIED") return "YARD_SLOT_OCCUPIED";
    if (code === "YARD_SLOT_LOCKED") return "YARD_SLOT_LOCKED";
    if (code === "RBAC_DENIED") return "RBAC_DENIED";
    return "";
  }

  submit(planId: number): void {
    const yard_slot_ids = [...this.selectedSlotIds];
    void this.store.approve(planId, { yard_slot_ids }).then((ok) => {
      if (ok) this.selectedSlotIds.clear();
      // 箱位可能刚被占用，刷新可选箱位
      void this.yard.loadList();
    });
  }
}
