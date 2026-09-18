export interface YardSlot {
  id: number;
  yard_area: string;
  row_no: string;
  bay_no: string;
  tier_no: string;
  container_no: string;
  slot_status: string;
  cargo_type: string;
  /** Approved berth plan currently holding the slot; null once released. */
  held_by_plan_id: number | null;
  version: number;
}
