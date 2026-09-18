/**
 * Single request wrapper: every /api call carries the review-env identity
 * headers so backend authMiddleware/rbacMiddleware can enforce dispatcher
 * privilege. Token-based Bearer auth can be plugged in here later.
 */
let activeRole = "DISPATCHER";
let activeUserId = 101;

export const setIdentity = (role: string, userId: number) => {
  activeRole = role;
  activeUserId = userId;
};

export const getIdentity = () => ({ role: activeRole, userId: activeUserId });

export const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-role": activeRole,
      "x-user-id": String(activeUserId),
      ...(init.headers ?? {})
    }
  });
  const body = (await res.json().catch(() => null)) as T & { code?: string; message?: string };
  if (!res.ok) {
    const error = new Error((body as { message?: string })?.message ?? `HTTP ${res.status}`) as Error & {
      status: number;
      code?: string;
      body: unknown;
    };
    error.status = res.status;
    error.code = (body as { code?: string })?.code;
    error.body = body;
    throw error;
  }
  return body as T;
};
