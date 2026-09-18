import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/** 冲突标记：泊位计划页/时间轴共用，红色标签给出冲突类型。 */
@Component({
  selector: "app-conflict-badge",
  standalone: true,
  imports: [CommonModule],
  template: `<span class="conflict-badge" *ngIf="kind">{{ icon }} {{ labelMap[kind] || kind }}</span>`,
  styles: [
    `
      .conflict-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #f7e2df;
        color: #8a2b20;
        border-radius: 6px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 700;
      }
    `
  ]
})
export class ConflictBadge {
  @Input() kind: "" | "BERTH_TIME_OVERLAP" | "YARD_SLOT_OCCUPIED" | "YARD_SLOT_LOCKED" | "RBAC_DENIED" = "";
  @Input() icon = "⚠";
  readonly labelMap: Record<string, string> = {
    BERTH_TIME_OVERLAP: "泊位时段重叠",
    YARD_SLOT_OCCUPIED: "箱位已占用",
    YARD_SLOT_LOCKED: "箱位已锁定",
    RBAC_DENIED: "无调度权限"
  };
}
