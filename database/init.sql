CREATE TABLE IF NOT EXISTS vessel (
  id INTEGER PRIMARY KEY,
  vessel_name TEXT,
  imo_no TEXT,
  carrier TEXT,
  length_m TEXT,
  draft_m TEXT,
  eta TEXT,
  etd TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS berth (
  id INTEGER PRIMARY KEY,
  berth_code TEXT,
  length_m TEXT,
  water_depth_m TEXT,
  berth_type TEXT,
  current_status TEXT,
  safety_note TEXT
);

CREATE TABLE IF NOT EXISTS berth_plan (
  id INTEGER PRIMARY KEY,
  vessel_id TEXT,
  berth_id TEXT,
  planned_arrival TEXT,
  planned_departure TEXT,
  priority TEXT,
  status TEXT,
  dispatcher_id TEXT
);

CREATE TABLE IF NOT EXISTS yard_slot (
  id INTEGER PRIMARY KEY,
  yard_area TEXT,
  row_no TEXT,
  bay_no TEXT,
  tier_no TEXT,
  container_no TEXT,
  slot_status TEXT,
  cargo_type TEXT
);

CREATE TABLE IF NOT EXISTS work_task (
  id INTEGER PRIMARY KEY,
  berth_plan_id TEXT,
  yard_slot_id TEXT,
  task_type TEXT,
  team_id TEXT,
  status TEXT,
  planned_start TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
