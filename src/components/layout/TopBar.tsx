import type { NetworkId } from "@/lib/config"
import { Logo } from "./Logo"
import { NetworkSwitch } from "./NetworkSwitch"

// The mark and page title on the left, the network switch (network pages only), the status pill (children) on the right.
export function TopBar({
  title,
  network,
  children,
}: {
  title: string
  network?: NetworkId
  children?: React.ReactNode
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <Logo />
        <h1>{title}</h1>
      </div>
      {network && <NetworkSwitch network={network} />}
      {children}
    </header>
  )
}
