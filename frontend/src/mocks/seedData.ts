export const mockData = {
  "vessel": [
    {
      "id": 1,
      "vessel_name": "远东先锋",
      "imo_no": "IMO-9472816",
      "carrier": "中远海运",
      "length_m": "294",
      "draft_m": "11.2",
      "eta": "2026-09-19T02:00:00Z",
      "etd": "2026-09-19T18:00:00Z",
      "status": "DRAFT"
    },
    {
      "id": 2,
      "vessel_name": "南方明珠",
      "imo_no": "IMO-9285623",
      "carrier": "招商轮船",
      "length_m": "240",
      "draft_m": "9.6",
      "eta": "2026-09-17T06:00:00Z",
      "etd": "2026-09-17T20:00:00Z",
      "status": "BERTHING"
    },
    {
      "id": 3,
      "vessel_name": "海风 8 号",
      "imo_no": "IMO-9901028",
      "carrier": "中外运",
      "length_m": "185",
      "draft_m": "7.4",
      "eta": "2026-09-20T01:30:00Z",
      "etd": "2026-09-20T14:00:00Z",
      "status": "DRAFT"
    }
  ],
  "berth": [
    {
      "id": 1,
      "berth_code": "A-01",
      "length_m": "320",
      "water_depth_m": "14.5",
      "berth_type": "CONTAINER",
      "current_status": "OCCUPIED",
      "safety_note": "注意北侧系缆桩磨损"
    },
    {
      "id": 2,
      "berth_code": "A-02",
      "length_m": "280",
      "water_depth_m": "12.0",
      "berth_type": "CONTAINER",
      "current_status": "IDLE",
      "safety_note": ""
    },
    {
      "id": 3,
      "berth_code": "B-01",
      "length_m": "220",
      "water_depth_m": "10.5",
      "berth_type": "BULK",
      "current_status": "IDLE",
      "safety_note": "夜间作业需加派照明"
    }
  ],
  "berthPlan": [
    {
      "id": 1,
      "vessel_id": 1,
      "berth_id": 2,
      "planned_arrival": "2026-09-19T03:00:00Z",
      "planned_departure": "2026-09-19T16:00:00Z",
      "priority": "HIGH",
      "status": "DRAFT",
      "dispatcher_id": 1
    },
    {
      "id": 2,
      "vessel_id": 2,
      "berth_id": 1,
      "planned_arrival": "2026-09-17T07:00:00Z",
      "planned_departure": "2026-09-17T19:00:00Z",
      "priority": "NORMAL",
      "status": "APPROVED",
      "dispatcher_id": 2
    },
    {
      "id": 3,
      "vessel_id": 3,
      "berth_id": 2,
      "planned_arrival": "2026-09-20T02:00:00Z",
      "planned_departure": "2026-09-20T13:00:00Z",
      "priority": "NORMAL",
      "status": "DRAFT",
      "dispatcher_id": 1
    }
  ],
  "yardSlot": [
    {
      "id": 1,
      "yard_area": "A 区",
      "row_no": "03",
      "bay_no": "12",
      "tier_no": "02",
      "container_no": "COSU-2917334",
      "slot_status": "OCCUPIED",
      "cargo_type": "GENERAL"
    },
    {
      "id": 2,
      "yard_area": "A 区",
      "row_no": "03",
      "bay_no": "13",
      "tier_no": "01",
      "container_no": "",
      "slot_status": "EMPTY",
      "cargo_type": "REEFER"
    },
    {
      "id": 3,
      "yard_area": "B 区",
      "row_no": "05",
      "bay_no": "08",
      "tier_no": "01",
      "container_no": "",
      "slot_status": "EMPTY",
      "cargo_type": "GENERAL"
    },
    {
      "id": 4,
      "yard_area": "B 区",
      "row_no": "05",
      "bay_no": "09",
      "tier_no": "01",
      "container_no": "",
      "slot_status": "EMPTY",
      "cargo_type": "HAZMAT"
    },
    {
      "id": 5,
      "yard_area": "C 区",
      "row_no": "01",
      "bay_no": "04",
      "tier_no": "03",
      "container_no": "MSKU-8840221",
      "slot_status": "LOCKED",
      "cargo_type": "HAZMAT"
    }
  ],
  "workTask": [
    {
      "id": 1,
      "berth_plan_id": 2,
      "yard_slot_id": 1,
      "task_type": "DISCHARGE",
      "team_id": 101,
      "status": "IN_PROGRESS",
      "planned_start": "2026-09-17T08:00:00Z",
      "finished_at": ""
    }
  ],
  "approvalFlow": [
    {
      "id": 1,
      "berth_plan_id": 2,
      "result": "APPROVED",
      "reason": "",
      "dispatcher_id": 2,
      "occupied_slot_ids": "1",
      "created_task_ids": "1",
      "created_at": "2026-09-16T09:12:00Z"
    }
  ]
} as const;
