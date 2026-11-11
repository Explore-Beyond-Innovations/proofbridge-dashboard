// The GET /v1/stats/network body (plan 155 D5).

export interface NetworkStats {
  range: string
  from: string | null
  to: string
  generatedAt: string
  trades: { reachedChain: number; completed: number; endedAfterLock: number; completionRate: number | null }
  volume: { tokenId: string; symbol: string; chainId: string; decimals: number; amount: string }[]
  settlement: { medianSeconds: number | null; buckets: { label: string; count: number }[] }
  proving: { medianProveMs: number | null }
  daily: { date: string; completed: number }[] // days with none left out
  disputes: {
    open: number
    MutualRefund: number
    TradeProceeds: number
    BridgerForfeit: number
    MakerForfeit: number
    Resolved: number
  }
}

// The dispute classes, in the order the page lists them.
export const DISPUTE_KEYS = ["MutualRefund", "BridgerForfeit", "MakerForfeit", "TradeProceeds", "Resolved", "open"] as const
