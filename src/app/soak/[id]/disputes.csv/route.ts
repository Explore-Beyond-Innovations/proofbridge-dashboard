import { csvResponse } from "../../../../lib/soak-fetch.ts"
import { disputesCsv } from "../../../../lib/soak.ts"

// Plan 158: the full disputes list of a published snapshot, quoted as plan 157's CSV writer.
export const revalidate = 300

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return csvResponse(id, "disputes", (s) => disputesCsv(s.report))
}
