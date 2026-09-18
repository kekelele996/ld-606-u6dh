export function usePagination<T>(rows: T[] = []) { return { rows, total: rows.length }; }
