import { FETCH_TIMEOUT_MS, apiBase } from "../config.ts"

/** ok with the parsed body; otherwise the HTTP status, or null when the fetch or the JSON failed. */
export type JsonResult = { ok: true; body: unknown } | { ok: false; status: number | null }

/** A server-side GET of a relayer path, revalidated by Next's data cache, with a timeout. */
export async function getJson(path: string, revalidate: number): Promise<JsonResult> {
  const base = apiBase()
  try {
    const res = await fetch(`${base}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    } as RequestInit)
    if (!res.ok) return { ok: false, status: res.status }
    return { ok: true, body: await res.json() }
  } catch {
    return { ok: false, status: null }
  }
}
