import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

const TONE: Record<string, string> = {
  APPROVED: "ok",
  DONE: "ok",
  EMPTY: "ok",
  FREE: "ok",
  DRAFT: "muted",
  PENDING: "muted",
  RESERVED: "warn",
  CONFLICT: "danger",
  REJECTED: "danger",
  OCCUPIED: "warn",
  LOCKED: "danger",
  BERTHING: "info",
  IN_PROGRESS: "info"
};

@Component({
  selector: "app-status-badge",
  standalone: true,
  imports: [CommonModule],
  template: `<span class="status-badge" [attr.data-tone]="tone">{{ text || status }}</span>`,
  styles: [
    `.status-badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;background:#eef1f5;color:#445}
     .status-badge[data-tone="ok"]{background:#e3f6e8;color:#1a7f37}
     .status-badge[data-tone="warn"]{background:#fff4e0;color:#9a6200}
     .status-badge[data-tone="danger"]{background:#fde8e8;color:#c02d2d}
     .status-badge[data-tone="info"]{background:#e6f0ff;color:#1d56c4}
     .status-badge[data-tone="muted"]{background:#eef1f5;color:#667}`
  ]
})
export class StatusBadge {
  @Input() status = "";
  @Input() text = "";
  get tone() {
    return TONE[this.status] ?? "muted";
  }
}
