import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { TopBar } from "@/components/layout/TopBar"
import { Report } from "@/components/soak/Report"
import { SoakStatus } from "@/components/soak/SoakStatus"
import { Unavailable } from "@/components/soak/Unavailable"
import { getSoakSnapshot } from "@/lib/api/soak-snapshots"

// Plan 158: snapshots are frozen; rebuilt at most every 5 min, matching the relayer's cache.
export const revalidate = 300 // SOAK_REVALIDATE in lib/config.ts; Next needs a literal

export const metadata: Metadata = { title: "Soak report · ProofBridge Dashboard" }

export default async function SoakPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getSoakSnapshot(id)
  if (result.kind === "missing") notFound()

  return (
    <main className="page">
      <TopBar title="ProofBridge Soak Report">
        <SoakStatus result={result} />
      </TopBar>
      {result.kind === "ok" ? <Report s={result.snapshot} /> : <Unavailable />}
    </main>
  )
}
