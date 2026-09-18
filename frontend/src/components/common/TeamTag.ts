import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/** 作业队标签：任务列表/详情共用。 */
@Component({
  selector: "app-team-tag",
  standalone: true,
  imports: [CommonModule],
  template: `<span class="team-tag">队伍 #{{ teamId }}</span>`,
  styles: [
    `
      .team-tag {
        background: #e7ecf3;
        color: #33445f;
        border-radius: 6px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 700;
      }
    `
  ]
})
export class TeamTag {
  @Input() teamId = 0;
}
