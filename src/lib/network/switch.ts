import { NETWORK_IDS, NETWORKS, type NetworkId } from "../config.ts"

export type SwitchLink = { id: NetworkId; label: string; href: string; current: boolean }

/** D2: one link per network, its own URL, the shown one marked current. */
export const switchLinks = (shown: NetworkId): SwitchLink[] =>
  NETWORK_IDS.map((id) => ({ id, label: NETWORKS[id].label, href: `/${id}`, current: id === shown }))
