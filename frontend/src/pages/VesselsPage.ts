import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VesselStore } from "../stores/VesselStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { formatDateTime } from "../utils/formatters";

/** 船舶预报：到港船舶列表与 ETA/ETD。 */
@Component({
  selector: "app-vessels-page",
  standalone: true,
  imports: [CommonModule, StatusBadge],
  template: `
    <section class="page-head">
      <div><p class="eyebrow">vessel forecast</p><h1>船舶预报</h1></div>
      <span class="badge">{{ store.rows().length }} 艘在报</span>
    </section>
    <section class="panel">
      <div class="row" *ngFor="let v of store.rows()">
        <div>
          <strong>{{ v.vessel_name }}</strong>
          <small style="color:#888;margin-left:8px">{{ v.imo_no }} · {{ v.carrier }}</small>
        </div>
        <span class="time">ETA {{ formatDateTime(v.eta) }} / ETD {{ formatDateTime(v.etd) }}</span>
        <app-status-badge [text]="v.status" [tone]="v.status.toLowerCase()"></app-status-badge>
      </div>
    </section>
  `
})
export class VesselsPage implements OnInit {
  readonly store = inject(VesselStore);
  readonly formatDateTime = formatDateTime;
  ngOnInit(): void {
    void this.store.loadList();
  }
}
