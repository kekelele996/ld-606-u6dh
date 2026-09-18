import { seed } from "../seed";
import type { BerthPlan } from "../models/BerthPlan";
import type { YardSlot } from "../models/YardSlot";
import type { WorkTask } from "../models/WorkTask";

export interface AuditLogRow {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

/** The set of tables participating in the approval transaction. */
export interface DbTables {
  berthPlan: BerthPlan[];
  yardSlot: YardSlot[];
  workTask: WorkTask[];
  auditLog: AuditLogRow[];
}

const cloneTables = (): DbTables =>
  structuredClone({
    berthPlan: seed.berthPlan,
    yardSlot: seed.yardSlot,
    workTask: seed.workTask,
    auditLog: seed.auditLog
  });

/**
 * Atomically swap staged tables back into the process-wide seed.
 * Every array is replaced inside one synchronous turn, so any reader
 * observes either the full before-state or the full after-state — never
 * a half-applied approval (e.g. status flipped but slots still free).
 */
const commitTables = (tables: DbTables): void => {
  seed.berthPlan.splice(0, seed.berthPlan.length, ...tables.berthPlan);
  seed.yardSlot.splice(0, seed.yardSlot.length, ...tables.yardSlot);
  seed.workTask.splice(0, seed.workTask.length, ...tables.workTask);
  seed.auditLog.splice(0, seed.auditLog.length, ...tables.auditLog);
};

/** Read-only view of the committed tables (for GET endpoints). */
export const committedTables: DbTables = {
  get berthPlan() {
    return seed.berthPlan;
  },
  get yardSlot() {
    return seed.yardSlot;
  },
  get workTask() {
    return seed.workTask;
  },
  get auditLog() {
    return seed.auditLog;
  }
};

/**
 * Process-wide writer mutex. Node is single-threaded but approval work is
 * async; the promise chain guarantees two concurrent POST /approve requests
 * (two dispatchers clicking at once) can never interleave their checks and
 * writes — they are serialised, and the loser fails the status/CAS re-check.
 */
let queueTail: Promise<unknown> = Promise.resolve();

export const withTransaction = async <T>(
  fn: (tables: DbTables) => Promise<T> | T
): Promise<T> => {
  const job = queueTail.then(async () => {
    // Snapshot first: a failed attempt is discarded wholesale, leaving the
    // three guarded resources (plan status / slot occupancy / tasks) intact.
    const snapshot = cloneTables();
    const result = await fn(snapshot);
    // Business logic returned normally -> all three effects land together.
    commitTables(snapshot);
    return result;
  });
  queueTail = job.catch(() => undefined);
  return job;
};
