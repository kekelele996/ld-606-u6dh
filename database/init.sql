-- port-yard schema (MySQL 8.0)
-- 审批靠泊计划的三项受控资源：berth_plan.status / yard_slot.held_by_plan_id / work_task 行，
-- 必须在一个事务内提交；berth_plan.version 为乐观锁版本号。

CREATE TABLE IF NOT EXISTS vessel (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vessel_name VARCHAR(128) NOT NULL,
  imo_no VARCHAR(32),
  carrier VARCHAR(128),
  length_m DECIMAL(8,2),
  draft_m DECIMAL(6,2),
  eta DATETIME NULL,
  etd DATETIME NULL,
  status VARCHAR(32)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS berth (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  berth_code VARCHAR(32) NOT NULL,
  length_m DECIMAL(8,2),
  water_depth_m DECIMAL(6,2),
  berth_type VARCHAR(32),
  current_status VARCHAR(32),
  safety_note VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS berth_plan (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vessel_id BIGINT NOT NULL,
  berth_id BIGINT NOT NULL,
  planned_arrival DATETIME NOT NULL,
  planned_departure DATETIME NOT NULL,
  priority VARCHAR(16) DEFAULT 'NORMAL',
  status VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
  dispatcher_id BIGINT NOT NULL DEFAULT 0,
  -- 审批时要占用的指定箱位列表（JSON 数组，元素为 yard_slot.id）
  yard_slot_ids JSON NULL,
  -- 审批通过后为每个箱位开出的装卸任务类型 LOAD/DISCHARGE/...
  task_type VARCHAR(16) NOT NULL DEFAULT 'DISCHARGE',
  -- 最近一次审批失败原因，成功后清空
  reject_reason VARCHAR(512) NULL,
  -- 乐观锁版本号：每次写入 +1，两个调度员并发审批只有 CAS 命中者成功
  version INT NOT NULL DEFAULT 0,
  KEY idx_berth_plan_berth_time (berth_id, planned_arrival, planned_departure),
  KEY idx_berth_plan_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 审批流转记录（提交/通过/拒绝），详情页展示最新流转结果与完整历史
CREATE TABLE IF NOT EXISTS berth_plan_transition (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  berth_plan_id BIGINT NOT NULL,
  dispatcher_id BIGINT NOT NULL,
  action VARCHAR(32) NOT NULL COMMENT 'SUBMIT_APPROVE / APPROVED / REJECTED',
  code VARCHAR(64) NULL COMMENT '失败错误码，如 BERTH_TIME_OVERLAP',
  reason VARCHAR(512) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_transition_plan (berth_plan_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS yard_slot (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  yard_area VARCHAR(16) NOT NULL,
  row_no VARCHAR(8) NOT NULL,
  bay_no VARCHAR(8) NOT NULL,
  tier_no VARCHAR(8) NOT NULL,
  container_no VARCHAR(32),
  slot_status VARCHAR(16) NOT NULL DEFAULT 'EMPTY' COMMENT 'EMPTY/RESERVED/OCCUPIED/LOCKED',
  cargo_type VARCHAR(32),
  -- 当前占用该箱位的已审批计划；释放后置 NULL。每个箱位是单行单列，
  -- 天然只能被一份计划占用；应用层在事务内 FOR UPDATE 锁定候选行保证并发一致。
  held_by_plan_id BIGINT NULL,
  version INT NOT NULL DEFAULT 0,
  KEY idx_slot_hold (held_by_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 说明：箱位为单行，held_by_plan_id 列保证一个箱位同一时刻最多绑定一份计划；
-- 应用层在审批事务内以 SELECT ... FOR UPDATE 锁定候选箱位行后再写入，
-- 配合 berth_plan.version 乐观锁，保证两个调度员并发审批只一份成功。

CREATE TABLE IF NOT EXISTS work_task (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  berth_plan_id BIGINT NOT NULL,
  yard_slot_id BIGINT NOT NULL,
  task_type VARCHAR(16) NOT NULL,
  team_id BIGINT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  planned_start DATETIME NULL,
  finished_at DATETIME NULL,
  KEY idx_task_plan (berth_plan_id),
  KEY idx_task_slot (yard_slot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  actor VARCHAR(64),
  action VARCHAR(255),
  target_type VARCHAR(32),
  target_id VARCHAR(32),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
