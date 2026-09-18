import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BerthPlanStore } from "../stores/BerthPlanStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { BerthTimeline } from "../components/common/BerthTimeline";
import { formatDateTime } from "../utils/formatters";

/** 港口运行总览：到港计划数、泊位占用率、在排时间轴、异常（冲突）计划。 */
@Component({
  selector: "app-dashboard-page",
  standalone: true,
  imports: [CommonModule, StatusBadge, BerthTimeline],
  template: `
    <section class="page-head">
      <div><p class="eyebrow">operations overview</p><h1>港口运行总览</h1></div>
      <span class="badge">LOCAL DATA</span>
    </section>

    <section class="metrics">
      <div class="stat"><span>靠泊计划</span><strong>{{ plans().length }}</strong></div>
      <div class="stat"><span>已审批 / 靠泊中</span><strong>{{ activeCount }}</strong></div>
      <div class="stat"><span>待审批草稿</span><strong>{{ draftCount }}</strong></div>
    </section>

    <section class="workbench">
      <div class="panel wide">
        <h2>泊位时间轴</h2>
        <app-berth-timeline [plans]="plans()"></app-berth-timeline>
      </div>
      <div class="panel">
        <h2>近期计划</h2>
        <div class="row" *ngFor="let plan of plans()">
          <strong>#{{ plan.id }} 泊位 {{ plan.berth_id }}</strong>
          <span class="time">{{ formatDateTime(plan.planned_arrival) }}</span>
          <app-status-badge [text]="plan.status" [tone]="plan.status.toLowerCase()"></app-status-badge>
        </div>
      </div>
    </section>
  `
})
export class DashboardPage implements OnInit {
  private readonly store = inject(BerthPlanStore);
  readonly plans = this.store.rows;
  readonly formatDateTime = formatDateTime;

  ngOnInit(): void {
    void this.store.loadList();
  }

  get activeCount(): number {
    return this.plans().filter((p) => ["APPROVED", "BERTHING"].includes(p.status)).length;
  }
  get draftCount(): number {
    return this.plans().filter((p) => ["DRAFT", "CONFLICT"].includes(p.status)).length;
  }
}
