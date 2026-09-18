import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { BerthPlan } from "../../types/BerthPlan";

/** 泊位时间轴：同一泊位上已审批/靠泊中的计划时段条（泊位计划页与总览页共用）。 */
@Component({
  selector: "app-berth-timeline",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline">
      <div class="lane" *ngFor="let lane of lanes">
        <strong>泊位 #{{ lane.berthId }}</strong>
        <div class="track">
          <span
            class="bar {{ plan.status === 'CONFLICT' ? 'conflict' : 'ok' }}"
            *ngFor="let plan of lane.plans"
            [style.left.%]="position(plan).start"
            [style.width.%]="position(plan).width"
            title="#{{ plan.id }} {{ plan.planned_arrival }} ~ {{ plan.planned_departure }}"
          >
            #{{ plan.id }}
          </span>
        </div>
      </div>
      <p class="hint" *ngIf="lanes.length === 0">暂无在排计划</p>
    </div>
  `,
  styles: [
    `
      .lane {
        display: grid;
        grid-template-columns: 86px 1fr;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      .track {
        position: relative;
        height: 26px;
        background: #f0eee4;
        border-radius: 6px;
      }
      .bar {
        position: absolute;
        top: 3px;
        height: 20px;
        border-radius: 4px;
        font-size: 11px;
        line-height: 20px;
        text-align: center;
        color: #223126;
        overflow: hidden;
      }
      .bar.ok {
        background: #cfe3c8;
      }
      .bar.conflict {
        background: #f3c4bd;
      }
      .hint {
        color: #777;
        font-size: 12px;
      }
    `
  ]
})
export class BerthTimeline {
  @Input() plans: BerthPlan[] = [];

  get lanes(): { berthId: number; plans: BerthPlan[] }[] {
    const byBerth = new Map<number, BerthPlan[]>();
    for (const plan of this.plans) {
      const list = byBerth.get(plan.berth_id) ?? [];
      list.push(plan);
      byBerth.set(plan.berth_id, list);
    }
    return [...byBerth.entries()].map(([berthId, lanePlans]) => ({ berthId, plans: lanePlans }));
  }

  /** 以全部计划的最早开始/最晚结束为标尺，把时段换算为百分比定位。 */
  position(plan: BerthPlan): { start: number; width: number } {
    const times = this.plans.flatMap((p) => [
      Date.parse(p.planned_arrival),
      Date.parse(p.planned_departure)
    ]);
    const min = Math.min(...times);
    const max = Math.max(...times);
    const span = Math.max(max - min, 1);
    const start = Date.parse(plan.planned_arrival);
    const end = Date.parse(plan.planned_departure);
    return {
      start: ((start - min) / span) * 100,
      width: Math.max(((end - start) / span) * 100, 4)
    };
  }
}
