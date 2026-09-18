import { committedTables, type DbTables } from "./db";
import type { AuditLogRow } from "./db";

export const auditLogRepository = {
  findAll: (): AuditLogRow[] => committedTables.auditLog,

  nextId: (tables: DbTables): number =>
    tables.auditLog.reduce((max, row) => Math.max(max, row.id), 0) + 1,

  insert: (
    tables: DbTables,
    entry: Omit<AuditLogRow, "id" | "created_at"> & { created_at?: string }
  ): AuditLogRow => {
    const row: AuditLogRow = {
      id: auditLogRepository.nextId(tables),
      created_at: entry.created_at ?? new Date().toISOString(),
      actor: entry.actor,
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id
    };
    tables.auditLog.push(row);
    return row;
  }
};
