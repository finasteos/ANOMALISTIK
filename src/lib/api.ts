// Central API client (TASKLIST F1) — typed fetch with timeout + safe JSON.
// Replaces scattered fetch('/api/*') with AbortController, error normalization.

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  constructor(message: string, status = 0, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function parseJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); }
  catch { throw new ApiError(`Non-JSON response (HTTP ${res.status})`, res.status, text.slice(0, 500)); }
}

async function request<T>(path: string, init: RequestInit = {}, timeoutMs = 25000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(path, { ...init, signal: ctrl.signal });
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      const msg = (data as any)?.error || `HTTP ${res.status}`;
      throw new ApiError(msg, res.status, data);
    }
    return data as T;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new ApiError(`Request timed out after ${timeoutMs}ms: ${path}`, 408);
    if (e instanceof ApiError) throw e;
    throw new ApiError(e?.message || `Network error: ${path}`, 0);
  } finally {
    clearTimeout(timer);
  }
}

export const apiGet = <T,>(path: string, timeoutMs?: number) =>
  request<T>(path, { method: 'GET' }, timeoutMs);

export const apiPost = <T,>(path: string, body: unknown, timeoutMs?: number) =>
  request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, timeoutMs);
