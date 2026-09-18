import { Injectable, signal } from "@angular/core";
import type { Vessel } from "../types/Vessel";
import { listVessel } from "../api/Vessel";

@Injectable({ providedIn: "root" })
export class VesselStore {
  readonly rows = signal<Vessel[]>([]);
  async loadList(): Promise<void> {
    this.rows.set(await listVessel());
  }
}
