import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { YardSlotStore } from "../stores/YardSlotStore";
import { StatusBadge } from "../components/common/StatusBadge";

/** 堆场箱位：箱位矩阵（按区域分组）与占用状态。 */
@Component({
  selector: "app-yard-page",
  standalone: true,
  imports: [CommonModule, StatusBadge],
  template: `
    <section class="page-head">
      <div><p class="eyebrow">yard slots</p><h1>堆场箱位</h1></div>
      <span class="badge">{{ store.rows().length }} 个箱位</span>
    </section>

    <section class="panel" *ngFor="let area of areas">
      <h2>{{ area }}</h2>
      <div class="grid">
        <div class="cell {{ slot.slot_status.toLowerCase() }}" *ngFor="let slot of byArea(area)">
          <strong>#{{ slot.id }}</strong>
          <small>{{ slot.row_no }}-{{ slot.bay_no }}-{{ slot.tier_no }}</small>
          <app-status-badge [text]="slot.slot_status" [tone]="slot.slot_status.toLowerCase()"></app-status-badge>
          <small class="container" *ngIf="slot.container_no">{{ slot.container_no }}</small>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
      }
      .cell {
        border: 1px solid #d8d6c8;
        border-radius: 8px;
        padding: 10px;
        display: grid;
        gap: 4px;
        background: #fbfaf4;
      }
      .cell.occupied,
      .cell.reserved {
        background: #fdf5e3;
      }
      .cell.locked {
        background: #fbeae7;
      }
      .container {
        color: #777;
        font-size: 11px;
      }
    `
  ]
})
export class YardPage implements OnInit {
  readonly store = inject(YardSlotStore);

  ngOnInit(): void {
    void this.store.loadList();
  }

  get areas(): string[] {
    return [...new Set(this.store.rows().map((slot) => slot.yard_area))];
  }

  byArea(area: string) {
    return this.store.rows().filter((slot) => slot.yard_area === area);
  }
}
