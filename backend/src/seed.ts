import { BerthPlan } from "./models/BerthPlan";
import { YardSlot } from "./models/YardSlot";
import { WorkTask } from "./models/WorkTask";

/**
 * Mutable in-process tables standing in for the MySQL tables defined in
 * database/init.sql. Repositories clone rows on read/write so that a
 * transaction can stage an isolated snapshot and commit it atomically.
 */
export const seed: {
  vessel: Array<Record<string, unknown>>;
  berth: Array<Record<string, unknown>>;
  berthPlan: BerthPlan[];
  yardSlot: YardSlot[];
  workTask: WorkTask[];
  auditLog: Array<{ id: number; actor: string; action: string; target_type: string; target_id: string; created_at: string }>;
} = {
  vessel: [
    { id: 1, vessel_name: "远东荣耀", imo_no: "IMO 9472011", carrier: "远东海运", length_m: 180, draft_m: 9.4, eta: "2026-09-19T02:00:00Z", etd: "2026-09-19T18:00:00Z", status: "EXPECTED" },
    { id: 2, vessel_name: "南海之星", imo_no: "IMO 9839102", carrier: "南海船务", length_m: 220, draft_m: 11.2, eta: "2026-09-20T04:00:00Z", etd: "2026-09-20T20:00:00Z", status: "EXPECTED" },
    { id: 3, vessel_name: "甬江快航", imo_no: "IMO 9221047", carrier: "甬江物流", length_m: 145, draft_m: 7.8, eta: "2026-09-21T06:00:00Z", etd: "2026-09-21T16:00:00Z", status: "EXPECTED" }
  ],
  berth: [
    { id: 1, berth_code: "B-01", length_m: 240, water_depth_m: 14, berth_type: "CONTAINER", current_status: "FREE", safety_note: "注意潮流" },
    { id: 2, berth_code: "B-02", length_m: 300, water_depth_m: 16, berth_type: "CONTAINER", current_status: "FREE", safety_note: "" },
    { id: 3, berth_code: "B-03", length_m: 180, water_depth_m: 10, berth_type: "FEEDER", current_status: "FREE", safety_note: "" }
  ],
  berthPlan: [
    {
      id: 1,
      vessel_id: 1,
      berth_id: 1,
      planned_arrival: "2026-09-19T02:00:00Z",
      planned_departure: "2026-09-19T18:00:00Z",
      priority: "HIGH",
      status: "DRAFT",
      dispatcher_id: 0,
      yard_slot_ids: [1, 2],
      task_type: "DISCHARGE",
      reject_reason: null,
      transitions: [],
      version: 0
    },
    {
      id: 2,
      vessel_id: 2,
      berth_id: 2,
      planned_arrival: "2026-09-20T04:00:00Z",
      planned_departure: "2026-09-20T20:00:00Z",
      priority: "NORMAL",
      status: "APPROVED",
      dispatcher_id: 101,
      yard_slot_ids: [3],
      task_type: "LOAD",
      reject_reason: null,
      transitions: [
        { at: "2026-09-15T08:10:00Z", dispatcher_id: 101, action: "APPROVED", code: undefined, reason: undefined }
      ],
      version: 1
    },
    {
      id: 3,
      vessel_id: 3,
      berth_id: 1,
      planned_arrival: "2026-09-19T12:00:00Z",
      planned_departure: "2026-09-20T02:00:00Z",
      priority: "LOW",
      status: "DRAFT",
      dispatcher_id: 0,
      yard_slot_ids: [4],
      task_type: "DISCHARGE",
      reject_reason: null,
      transitions: [],
      version: 0
    }
  ],
  yardSlot: [
    { id: 1, yard_area: "A", row_no: "01", bay_no: "01", tier_no: "01", container_no: "", slot_status: "EMPTY", cargo_type: "GENERAL", held_by_plan_id: null, version: 0 },
    { id: 2, yard_area: "A", row_no: "01", bay_no: "02", tier_no: "01", container_no: "", slot_status: "EMPTY", cargo_type: "GENERAL", held_by_plan_id: null, version: 0 },
    { id: 3, yard_area: "B", row_no: "02", bay_no: "01", tier_no: "02", container_no: "CBHU8821047", slot_status: "OCCUPIED", cargo_type: "REEFER", held_by_plan_id: 2, version: 1 },
    { id: 4, yard_area: "B", row_no: "02", bay_no: "03", tier_no: "01", container_no: "", slot_status: "LOCKED", cargo_type: "DANGEROUS", held_by_plan_id: null, version: 0 },
    { id: 5, yard_area: "C", row_no: "03", bay_no: "01", tier_no: "01", container_no: "", slot_status: "EMPTY", cargo_type: "GENERAL", held_by_plan_id: null, version: 0 }
  ],
  workTask: [
    { id: 1, berth_plan_id: 2, yard_slot_id: 3, task_type: "LOAD", team_id: null, status: "PENDING", planned_start: "2026-09-20T04:30:00Z", finished_at: null }
  ],
  auditLog: []
};
