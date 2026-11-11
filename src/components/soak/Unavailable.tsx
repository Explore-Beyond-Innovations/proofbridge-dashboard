import { SoakFooter } from "@/components/layout/Footer"
import { DASH } from "@/lib/format/text"

export function Unavailable() {
  return (
    <div className="body">
      <div className="empty">{DASH}</div>
      <SoakFooter />
    </div>
  )
}
