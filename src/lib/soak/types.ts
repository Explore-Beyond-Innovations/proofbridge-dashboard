// Plan 158: the GET /v1/soak-reports/:id body (relayer soak-report.dto.ts).
import type { NetworkStats } from "../network/types.ts"

export interface SoakScorecardRow {
  criterion: string
  target: string
  result: string
  /** null: the team checks it by hand */
  met: boolean | null
}

export interface SoakOperator {
  identity: string
  chainId: string
  chainName: string | null
  locks: number
  firstLockAt: string
  firstLockTx: string
  firstLockUrl: string | null
  agentAccount: boolean
  hostedPod: boolean
}

export interface SoakBridgeLeg {
  chainId: string
  chainName: string | null
  txHash: string
  explorerUrl: string | null
  at: string
}

export interface SoakBridge {
  tradeId: string
  legs: SoakBridgeLeg[]
  settledAt: string
}

export interface SoakTx {
  kind: string
  chainId: string
  txHash: string
  explorerUrl: string | null
}

export interface SoakDispute {
  caseId: string
  tradeId: string
  status: string
  filerRole: string | null
  filer: string | null
  outcome: string | null
  ruled: boolean
  closed: boolean
  filedAt: string
  closedAt: string | null
  txs: SoakTx[]
}

export interface SoakReport {
  window: { from: string; to: string; days: number }
  definitions: { operator: string; bridge: string; disputeLifecycle: string }
  scorecard: SoakScorecardRow[]
  operators: SoakOperator[]
  bridges: SoakBridge[]
  disputes: SoakDispute[]
  performance: {
    allTime: {
      completed: number
      settlement: NetworkStats["settlement"]
      proving: NetworkStats["proving"]
      volume: NetworkStats["volume"]
      disputes: NetworkStats["disputes"]
    }
    daily: NetworkStats["daily"]
  }
  generatedAt: string
}

export interface SoakSnapshot {
  id: string
  publishedAt: string
  window: { from: string; to: string }
  incidents: string | null
  report: SoakReport
}
