export const seed = {
  "vessel": [
    {
      "id": 1,
      "vessel_name": "vessel name 1",
      "imo_no": "imo no 1",
      "carrier": "carrier 1",
      "length_m": "length m 1",
      "draft_m": "draft m 1",
      "eta": "eta 1",
      "etd": "etd 1",
      "status": "CONFLICT"
    },
    {
      "id": 2,
      "vessel_name": "vessel name 2",
      "imo_no": "imo no 2",
      "carrier": "carrier 2",
      "length_m": "length m 2",
      "draft_m": "draft m 2",
      "eta": "eta 2",
      "etd": "etd 2",
      "status": "APPROVED"
    },
    {
      "id": 3,
      "vessel_name": "vessel name 3",
      "imo_no": "imo no 3",
      "carrier": "carrier 3",
      "length_m": "length m 3",
      "draft_m": "draft m 3",
      "eta": "eta 3",
      "etd": "etd 3",
      "status": "DRAFT"
    }
  ],
  "berth": [
    {
      "id": 1,
      "berth_code": "berth code 1",
      "length_m": "length m 1",
      "water_depth_m": "water depth m 1",
      "berth_type": "CONFLICT",
      "current_status": "CONFLICT",
      "safety_note": "safety note 1"
    },
    {
      "id": 2,
      "berth_code": "berth code 2",
      "length_m": "length m 2",
      "water_depth_m": "water depth m 2",
      "berth_type": "APPROVED",
      "current_status": "APPROVED",
      "safety_note": "safety note 2"
    },
    {
      "id": 3,
      "berth_code": "berth code 3",
      "length_m": "length m 3",
      "water_depth_m": "water depth m 3",
      "berth_type": "BERTHING",
      "current_status": "DRAFT",
      "safety_note": "safety note 3"
    }
  ],
  "berthPlan": [
    {
      "id": 1,
      "vessel_id": 1,
      "berth_id": 1,
      "planned_arrival": "planned arrival 1",
      "planned_departure": "planned departure 1",
      "priority": "priority 1",
      "status": "CONFLICT",
      "dispatcher_id": 1
    },
    {
      "id": 2,
      "vessel_id": 2,
      "berth_id": 2,
      "planned_arrival": "planned arrival 2",
      "planned_departure": "planned departure 2",
      "priority": "priority 2",
      "status": "APPROVED",
      "dispatcher_id": 2
    },
    {
      "id": 3,
      "vessel_id": 3,
      "berth_id": 3,
      "planned_arrival": "planned arrival 3",
      "planned_departure": "planned departure 3",
      "priority": "priority 3",
      "status": "DRAFT",
      "dispatcher_id": 3
    }
  ],
  "yardSlot": [
    {
      "id": 1,
      "yard_area": "yard area 1",
      "row_no": "row no 1",
      "bay_no": "bay no 1",
      "tier_no": "tier no 1",
      "container_no": "container no 1",
      "slot_status": "CONFLICT",
      "cargo_type": "CONFLICT"
    },
    {
      "id": 2,
      "yard_area": "yard area 2",
      "row_no": "row no 2",
      "bay_no": "bay no 2",
      "tier_no": "tier no 2",
      "container_no": "container no 2",
      "slot_status": "APPROVED",
      "cargo_type": "APPROVED"
    },
    {
      "id": 3,
      "yard_area": "yard area 3",
      "row_no": "row no 3",
      "bay_no": "bay no 3",
      "tier_no": "tier no 3",
      "container_no": "container no 3",
      "slot_status": "DRAFT",
      "cargo_type": "BERTHING"
    }
  ],
  "workTask": [
    {
      "id": 1,
      "berth_plan_id": 1,
      "yard_slot_id": 1,
      "task_type": "CONFLICT",
      "team_id": 1,
      "status": "CONFLICT",
      "planned_start": "planned start 1",
      "finished_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "berth_plan_id": 2,
      "yard_slot_id": 2,
      "task_type": "APPROVED",
      "team_id": 2,
      "status": "APPROVED",
      "planned_start": "planned start 2",
      "finished_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "berth_plan_id": 3,
      "yard_slot_id": 3,
      "task_type": "BERTHING",
      "team_id": 3,
      "status": "DRAFT",
      "planned_start": "planned start 3",
      "finished_at": "2026-06-13T09:00:00Z"
    }
  ]
} as const;
