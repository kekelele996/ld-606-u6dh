import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkTaskStore } from "../stores/WorkTaskStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { TeamTag } from "../components/common/TeamTag";
import { formatDateTime } from "../utils/formatters";

/** 作业派工：审批通过后开出的装卸任务清单。 */
@Component({
  selector: "app-tasks-page",
  standalone: true,
  imports: [CommonModule, StatusBadge, TeamTag],
  template: `
    <section class="page-head">
      <div><p class="eyebrow">work tasks</p><h1>作业派工</h1></div>
      <span class="badge">{{ store.rows().length }} 条任务</span>
    </section>

    <section class="panel">
      <div class="row task-row" *ngFor="let task of store.rows()">
        <app-status-badge [text]="task.task_type"></app-status-badge>
        <span>计划 #{{ task.berth_plan_id }} · 箱位 #{{ task.yard_slot_id }}</span>
        <app-team-tag [teamId]="task.team_id"></app-team-tag>
        <span class="time">{{ formatDateTime(task.planned_start) }}</span>
        <app-status-badge [text]="task.status" [tone]="task.status.toLowerCase()"></app-status-badge>
      </div>
      <p class="hint" *ngIf="store.rows().length === 0">暂无任务，审批靠泊计划后自动开出装卸任务。</p>
    </section>
  `
})
export class TasksPage implements OnInit {
  readonly store = inject(WorkTaskStore);
  readonly formatDateTime = formatDateTime;
  ngOnInit(): void {
    void this.store.loadList();
  }
}
