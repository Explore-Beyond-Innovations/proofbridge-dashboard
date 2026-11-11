// A GET /v1/soak-reports/:id body shaped from the relayer's SoakReportDto (plan 157) and plan 158's public route.
const hash = (c: string) => `0x${c.repeat(64)}`
const SEP = "11155111"
const XLM = "1000002"

export const snapshotBody = () => ({
  id: "aB3dE5gH7j",
  publishedAt: "2026-11-10T12:30:00.000Z",
  window: { from: "2026-10-26T00:00:00.000Z", to: "2026-11-10T00:00:00.000Z" },
  incidents: "Relayer restarted on 2 Nov.\nNo rollback.\n\n<script>alert(1)</script> **bold**",
  report: {
    window: { from: "2026-10-26T00:00:00.000Z", to: "2026-11-10T00:00:00.000Z", days: 15 },
    definitions: { operator: "A distinct maker identity.", bridge: "A trade with verified unlocks.", disputeLifecycle: "A closed case." },
    scorecard: [
      { criterion: "Soak length", target: "14 days, no rollback", result: "15.0 days; rollback: see Incidents", met: true },
      { criterion: "End-to-end bridges", target: "≥ 50", result: "2", met: false },
      { criterion: "Public dashboard", target: "Live", result: "dashboard.pfbridge.xyz", met: null },
    ],
    operators: [
      {
        identity: "0xd2306c80a26fe4b63ff89fd55f736b17cd425bf0",
        chainId: SEP,
        chainName: "Ethereum Sepolia",
        locks: 12,
        firstLockAt: "2026-10-26T10:00:00.000Z",
        firstLockTx: hash("ab"),
        firstLockUrl: `https://sepolia.etherscan.io/tx/${hash("ab")}`,
        agentAccount: true,
        hostedPod: false,
      },
    ],
    bridges: [
      {
        tradeId: "t-1",
        settledAt: "2026-10-27T10:05:00.000Z",
        legs: [
          { chainId: XLM, chainName: null, txHash: "c".repeat(64), explorerUrl: `https://stellar.expert/explorer/testnet/tx/${"c".repeat(64)}`, at: "2026-10-27T10:05:00.000Z" },
          { chainId: SEP, chainName: "Ethereum Sepolia", txHash: hash("d"), explorerUrl: null, at: "2026-10-27T10:00:00.000Z" },
        ],
      },
      {
        tradeId: 'odd,"id"',
        settledAt: "2026-10-28T10:00:00.000Z",
        legs: [{ chainId: SEP, chainName: null, txHash: hash("e"), explorerUrl: null, at: "2026-10-28T10:00:00.000Z" }],
      },
    ],
    disputes: [
      {
        caseId: "case-1",
        tradeId: "t-1",
        status: "closed",
        filerRole: "bridger",
        filer: "0xd2306c80a26fe4b63ff89fd55f736b17cd425bf0",
        outcome: "Resolved",
        ruled: false,
        closed: true,
        filedAt: "2026-10-29T00:00:00.000Z",
        closedAt: "2026-10-30T00:00:00.000Z",
        txs: [
          { kind: "dispute_filed", chainId: SEP, txHash: hash("f"), explorerUrl: "https://sepolia.etherscan.io/tx/0xf" },
          { kind: "unlock", chainId: XLM, txHash: "9".repeat(64), explorerUrl: null },
        ],
      },
      {
        caseId: "case-2",
        tradeId: "t-2",
        status: "open",
        filerRole: null,
        filer: null,
        outcome: null,
        ruled: false,
        closed: false,
        filedAt: "2026-11-01T00:00:00.000Z",
        closedAt: null,
        txs: [],
      },
    ],
    performance: {
      allTime: {
        completed: 154,
        settlement: { medianSeconds: 109, buckets: [{ label: "<1m", count: 27 }] },
        proving: { medianProveMs: 845 },
        volume: [{ tokenId: "t1", symbol: "PB", chainId: XLM, decimals: 7, amount: "491010000000" }],
        disputes: { open: 0, MutualRefund: 1, TradeProceeds: 0, BridgerForfeit: 0, MakerForfeit: 0, Resolved: 6 },
      },
      daily: [{ date: "2026-10-27", completed: 1 }],
    },
    generatedAt: "2026-11-10T12:29:59.000Z",
  },
})
