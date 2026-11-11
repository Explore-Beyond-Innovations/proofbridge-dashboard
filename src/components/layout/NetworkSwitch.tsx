import type { NetworkId } from "@/lib/config"
import { switchLinks } from "@/lib/network/switch"

// D2: plain links, so each network has its own URL and the page needs no client JavaScript.
export function NetworkSwitch({ network }: { network: NetworkId }) {
  return (
    <nav className="switch" aria-label="Network">
      {switchLinks(network).map((l) => (
        <a key={l.id} className="switch__link" href={l.href} aria-current={l.current ? "page" : undefined}>
          {l.label}
        </a>
      ))}
    </nav>
  )
}
