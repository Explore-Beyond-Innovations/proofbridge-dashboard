import { SOAK_REVALIDATE } from "../config.ts"
import type { SoakSnapshot } from "../soak/types.ts"
import { getSoakSnapshot } from "./soak-snapshots.ts"

/** The CSV download response for a route handler: 404 for missing, 503 for unavailable. */
export async function csvResponse(id: string, name: "bridges" | "disputes", build: (s: SoakSnapshot) => string) {
  const r = await getSoakSnapshot(id)
  if (r.kind === "missing") return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } })
  if (r.kind === "unavailable")
    return new Response("Soak report unavailable right now. Try again in a minute.\n", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" },
    })
  return new Response(build(r.snapshot), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="soak-${r.snapshot.id}-${name}.csv"`,
      "Cache-Control": `public, max-age=${SOAK_REVALIDATE}`,
    },
  })
}
