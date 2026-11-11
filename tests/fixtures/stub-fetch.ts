// Swaps global fetch for one canned response per test, and puts the real one back after.
import { afterEach } from "node:test"

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

// Serves one response for every fetch and records the URLs asked for.
export function serve(status: number, body: unknown): string[] {
  const urls: string[] = []
  globalThis.fetch = (async (url: string | URL) => {
    urls.push(String(url))
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status })
  }) as typeof fetch
  return urls
}
