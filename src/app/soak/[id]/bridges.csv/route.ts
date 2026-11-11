import { csvResponse } from "../../../../lib/api/csv-response.ts"
import { bridgesCsv } from "../../../../lib/soak/csv.ts"

// Plan 158: the full bridges list of a published snapshot, quoted as plan 157's CSV writer.
export const revalidate = 300 // SOAK_REVALIDATE in lib/config.ts; Next needs a literal

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return csvResponse(id, "bridges", (s) => bridgesCsv(s.report))
}
