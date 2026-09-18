import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * 共享状态徽标：靠泊计划 / 箱位 / 任务 / 审批结果通用。
 * 颜色按状态族归类，多个页面共用同一展示口径。
 */
@Component({
  selector: "app-status-badge",
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge status-{{ tone }}">{{ label || text }}</span>`,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        border-radius: 999px;
        padding: 2px 10px;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
      }
      .status-approved,
      .status-completed,
      .status-empty,
      .status-departed {
        background: #e4efe4;
        color: #244b31;
      }
      .status-draft,
      .status-pending {
        background: #e7ecf3;
        color: #33445f;
      }
      .status-conflict,
      .status-rejected,
      .status-locked {
        background: #f7e2df;
        color: #8a2b20;
      }
      .status-berthing,
      .status-in_progress,
      .status-reserved,
      .status-occupied {
        background: #fbeecf;
        color: #7d4d18;
      }
      .status-cancelled {
        background: #e6e3da;
        color: #5d5a50;
      }
    `
  ]
})
export class StatusBadge {
  @Input() text = "";
  /** 显式指定颜色族；缺省用原始状态串映射。 */
  @Input() tone = "";
  @Input() label = "";
}
