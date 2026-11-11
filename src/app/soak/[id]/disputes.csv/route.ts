import { csvResponse } from "../../../../lib/api/csv-response.ts"
import { disputesCsv } from "../../../../lib/soak/csv.ts"

// Plan 158: the full disputes list of a published snapshot, quoted as plan 157's CSV writer.
export const revalidate = 300 // SOAK_REVALIDATE in lib/config.ts; Next needs a literal

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return csvResponse(id, "disputes", (s) => disputesCsv(s.report))
}
