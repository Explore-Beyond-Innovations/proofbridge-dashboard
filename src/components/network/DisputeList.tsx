import { countText } from "@/lib/format/numbers"
import { DASH } from "@/lib/format/text"
import type { NetworkStats } from "@/lib/network/types"
import { disputeRows } from "@/lib/network/view"

// One row per dispute class (zero rows dimmed), or a dash when the stats are down. The soak page reuses it.
export function DisputeList({ disputes }: { disputes: NetworkStats["disputes"] | null }) {
  return (
    <ul className="rows">
      {disputes ? (
        disputeRows(disputes).map((r) => (
          <li key={r.label} className={r.count === 0 ? "rows__zero" : undefined}>
            <span>{r.label}</span>
            <span>{countText(r.count)}</span>
          </li>
        ))
      ) : (
        <li>
          <span>{DASH}</span>
        </li>
      )}
    </ul>
  )
}
