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

-- 靠泊计划审批流转记录：详情页展示「最新流转结果 + 失败原因」。
-- 审批状态/箱位占用/任务创建三项在同一事务一次保存；
-- 审批被拒时仅往本表追加一条 REJECTED，业务三项保持原样。
CREATE TABLE IF NOT EXISTS approval_flow (
  id INTEGER PRIMARY KEY,
  berth_plan_id INTEGER NOT NULL,
  result TEXT NOT NULL,             -- APPROVED / REJECTED
  reason TEXT NOT NULL DEFAULT '',  -- 拒绝原因（成功为空串）
  dispatcher_id INTEGER,
  occupied_slot_ids TEXT NOT NULL DEFAULT '', -- 逗号分隔
  created_task_ids TEXT NOT NULL DEFAULT '',  -- 逗号分隔
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_flow_plan ON approval_flow (berth_plan_id, created_at);
CREATE INDEX IF NOT EXISTS idx_work_task_plan ON work_task (berth_plan_id);
CREATE INDEX IF NOT EXISTS idx_berth_plan_berth_time ON berth_plan (berth_id, planned_arrival, planned_departure);
