// Trimmed from a real staging response (2026-11-11).
export const networkStatsBody = () => ({
  range: "30d",
  from: "2026-10-12T08:53:08.184Z",
  to: "2026-11-11T08:53:08.184Z",
  generatedAt: "2026-11-11T08:53:08.184Z",
  trades: { reachedChain: 337, completed: 154, endedAfterLock: 105, completionRate: 0.5946 },
  volume: [{ tokenId: "t1", symbol: "PB", chainId: "1000002", decimals: 7, amount: "491010000000" }],
  settlement: { medianSeconds: 109, buckets: [{ label: "<1m", count: 27 }] },
  proving: { medianProveMs: 845 },
  daily: [{ date: "2026-11-09", completed: 23 }],
  disputes: { open: 0, MutualRefund: 1, TradeProceeds: 0, BridgerForfeit: 0, MakerForfeit: 0, Resolved: 6 },
})
