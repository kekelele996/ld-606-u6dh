import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-conflict-badge",
  standalone: true,
  imports: [CommonModule],
  template: `<span class="conflict-badge" [class.hit]="conflict" [attr.title]="reason ?? ''">
    <ng-content></ng-content>{{ conflict ? "冲突" : "无冲突" }}<span class="reason" *ngIf="conflict && reason">：{{ reason }}</span>
  </span>`,
  styles: [
    `.conflict-badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;background:#e3f6e8;color:#1a7f37}
     .conflict-badge.hit{background:#fde8e8;color:#c02d2d}
     .reason{font-weight:400}`
  ]
})
export class ConflictBadge {
  @Input() conflict = false;
  @Input() reason: string | null = null;
}
