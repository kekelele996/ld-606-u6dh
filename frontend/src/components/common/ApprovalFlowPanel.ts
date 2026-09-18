import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { ApprovalFlow } from "../../types/ApprovalFlow";
import { StatusBadge } from "./StatusBadge";
import { ApprovalResultText } from "../../constants/ApprovalResult";
import { formatDateTime } from "../../utils/formatters";

/**
 * 审批流转面板（详情页）：
 * - 顶部展示「最新流转结果」：审批通过 / 审批拒绝
 * - 拒绝时突出展示失败原因，并给出错误归类标题
 * - 下方列出历史流转，便于追溯两个调度员并发时谁成功谁失败
 */
@Component({
  selector: "app-approval-flow-panel",
  standalone: true,
  imports: [CommonModule, StatusBadge],
  template: `
    <section class="panel flow-panel">
      <h2>审批流转</h2>

      <div class="latest {{ latest.result.toLowerCase() }}" *ngIf="latest; else neverTried">
        <div class="latest-head">
          <span class="caption">最新流转结果</span>
          <app-status-badge
            [text]="resultText[latest.result]"
            [tone]="latest.result === 'APPROVED' ? 'approved' : 'rejected'"
          ></app-status-badge>
        </div>

        <div class="reason" *ngIf="latest.result === 'REJECTED'">
          <span class="reason-title">审批被拒绝（整次未保存）</span>
          <p>{{ latest.reason }}</p>
          <small>整次拒绝：审批状态、箱位占用、装卸任务三项均保持原样</small>
        </div>

        <div class="success-detail" *ngIf="latest.result === 'APPROVED'">
          <p>已同时占用箱位：<strong #slots>{{ latest.occupied_slot_ids || "—" }}</strong></p>
          <p>已开出任务：<strong>{{ latest.created_task_ids || "—" }}</strong></p>
          <small>审批调度员 #{{ latest.dispatcher_id }} · {{ formatDateTime(latest.created_at) }}</small>
        </div>
      </div>

      <ng-template #neverTried><p class="hint">该计划尚未提交审批。</p></ng-template>

      <h3 *ngIf="flows.length > 1">历史流转</h3>
      <ul class="history" *ngIf="flows.length > 1">
        <li *ngFor="let flow of flows">
          <app-status-badge
            [text]="resultText[flow.result]"
            [tone]="flow.result === 'APPROVED' ? 'approved' : 'rejected'"
          ></app-status-badge>
          <span class="who">调度员 #{{ flow.dispatcher_id }}</span>
          <span class="time">{{ formatDateTime(flow.created_at) }}</span>
          <span class="reason-text" *ngIf="flow.reason">{{ flow.reason }}</span>
        </li>
      </ul>
    </section>
  `,
  styles: [
    `
      .latest {
        border-radius: 8px;
        padding: 14px 16px;
        border: 1px solid #d8d6c8;
      }
      .latest.approved {
        background: #f0f7ee;
        border-color: #bcd8b4;
      }
      .latest.rejected {
        background: #fdf1ef;
        border-color: #ecc3bc;
      }
      .latest-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .caption {
        font-size: 13px;
        color: #596257;
        font-weight: 700;
      }
      .reason-title {
        display: inline-block;
        margin-top: 10px;
        font-weight: 800;
        color: #8a2b20;
      }
      .reason p {
        margin: 6px 0;
        color: #6d241b;
      }
      .reason small,
      .success-detail small {
        color: #777;
      }
      .hint {
        color: #777;
      }
      .history {
        list-style: none;
        margin: 8px 0 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }
      .history li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        border-top: 1px dashed #ddd8c8;
        padding-top: 8px;
        flex-wrap: wrap;
      }
      .reason-text {
        color: #8a2b20;
      }
      .time {
        color: #888;
      }
    `
  ]
})
export class ApprovalFlowPanel {
  /** 倒序：最新在第一位。 */
  @Input() flows: ApprovalFlow[] = [];

  readonly resultText = ApprovalResultText;
  readonly formatDateTime = formatDateTime;

  get latest(): ApprovalFlow | undefined {
    return this.flows[0];
  }
}
