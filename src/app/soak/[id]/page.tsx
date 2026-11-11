import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DailyBars, Logo, Metric, Section, SpeedBars } from "@/app/components"
import { getSoakSnapshot } from "@/lib/soak-fetch"
import {
  BRIDGE_ROWS,
  accountText,
  addressUrl,
  chainName,
  chainOfAddress,
  dayText,
  kindText,
  lastInstant,
  legChains,
  metLabel,
  outcomeLabel,
  paragraphs,
  roleText,
  safeUrl,
  short,
  timeText,
  windowText,
  type SoakSnapshot,
} from "@/lib/soak"
import { DASH, countText, disputeRows, durationText, fillDaily, proveText, tokenAmount } from "@/lib/view"

// Plan 158: snapshots are frozen; rebuilt at most every 5 min, matching the relayer's cache.
export const revalidate = 300

export const metadata: Metadata = { title: "Soak report · ProofBridge Dashboard" }

export default async function SoakPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getSoakSnapshot(id)
  if (result.kind === "missing") notFound()

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <Logo />
          <h1>ProofBridge Soak Report</h1>
        </div>
        {result.kind === "ok" ? (
          <span className="pill">
            <span className="dot dot--ok" aria-hidden />
            Published {timeText(result.snapshot.publishedAt)}
          </span>
        ) : (
          <span className="pill pill--warn">
            <span className="dot dot--warn" aria-hidden />
            Report unavailable right now. Try again in a minute.
          </span>
        )}
      </header>
      {result.kind === "ok" ? <Report s={result.snapshot} /> : <Unavailable />}
    </main>
  )
}

function Unavailable() {
  return (
    <div className="body">
      <div className="empty">{DASH}</div>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <p className="footer">
      See the live network stats at <a href="/">dashboard.pfbridge.xyz</a> · Read the docs at{" "}
      <a href="https://docs.pfbridge.xyz">docs.pfbridge.xyz</a>.
    </p>
  )
}

// Opens explorers in a new tab; a missing or non-https URL shows the text alone.
function Ext({ href, children }: { href: string | null | undefined; children: React.ReactNode }) {
  const url = safeUrl(href)
  if (!url) return <span className="mono">{children}</span>
  return (
    <a className="mono" href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Report({ s }: { s: SoakSnapshot }) {
  const r = s.report
  const all = r.performance.allTime
  const legs = legChains(r)
  const shown = r.bridges.slice(0, BRIDGE_ROWS)
  const closed = r.disputes.filter((d) => d.closed).length
  const notes = paragraphs(s.incidents)
  const base = `/soak/${encodeURIComponent(s.id)}`

  return (
    <>
      <p className="intro">
        The ProofBridge testnet soak on Sepolia and Stellar testnet, {windowText(s.window.from, s.window.to)} (
        {r.window.days.toFixed(1)} days). The numbers were frozen when the report was published, and every bridge and
        dispute links to its transactions on the public explorers.
      </p>

      <div className="stats">
        <Metric label="Bridges" value={countText(r.bridges.length)} hint="Settled end to end inside the window" />
        <Metric label="Operators" value={countText(r.operators.length)} hint="Distinct makers that locked an order" />
        <Metric
          label="Disputes"
          value={countText(r.disputes.length)}
          hint={`Filed inside the window, ${countText(closed)} closed`}
        />
      </div>

      <div className="body">
        <Section title="Scorecard" subtitle="The soak's exit criteria">
          <Table head={["Criterion", "Target", "Result", "Status"]}>
            {r.scorecard.map((c) => {
              const m = metLabel(c.met)
              return (
                <tr key={c.criterion}>
                  <td>{c.criterion}</td>
                  <td>{c.target}</td>
                  <td>{c.result}</td>
                  <td>
                    <span className={`tag tag--${m.tone}`}>{m.text}</span>
                  </td>
                </tr>
              )
            })}
          </Table>
          <dl className="defs">
            <dt>Operator</dt>
            <dd>{r.definitions.operator}</dd>
            <dt>Bridge</dt>
            <dd>{r.definitions.bridge}</dd>
            <dt>Dispute lifecycle</dt>
            <dd>{r.definitions.disputeLifecycle}</dd>
          </dl>
        </Section>

        <Section title="Operators" subtitle={`${countText(r.operators.length)} ${r.operators.length === 1 ? "maker" : "makers"} locked orders in the window`}>
          {r.operators.length === 0 ? (
            <div className="empty empty--short">No operators in the window</div>
          ) : (
            <Table head={["Maker", "Chain", "Locks", "First lock", "Account"]}>
              {r.operators.map((o) => (
                <tr key={`${o.chainId}:${o.identity}`}>
                  <td>
                    <Ext href={addressUrl(o.identity, o.chainId)}>{short(o.identity)}</Ext>
                  </td>
                  <td>{chainName(o.chainId, o.chainName)}</td>
                  <td className="num">{countText(o.locks)}</td>
                  <td>
                    <Ext href={o.firstLockUrl}>{short(o.firstLockTx)}</Ext>
                    <span className="rows__sub when"> {timeText(o.firstLockAt)}</span>
                  </td>
                  <td>{accountText(o)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Section>

        <Section
          title="Bridges"
          subtitle={
            r.bridges.length > shown.length
              ? `${countText(r.bridges.length)} bridges; the first ${countText(shown.length)} are shown, oldest first`
              : `${countText(r.bridges.length)} bridges, oldest first`
          }
        >
          {shown.length === 0 ? (
            <div className="empty empty--short">No bridges in the window</div>
          ) : (
            <Table head={["Trade", "Settled", ...legs.map((c) => `Unlock on ${chainName(c)}`)]}>
              {shown.map((b) => (
                <tr key={b.tradeId}>
                  <td className="mono">{short(b.tradeId)}</td>
                  <td className="when">{timeText(b.settledAt)}</td>
                  {legs.map((c) => {
                    const l = b.legs.find((x) => x.chainId === c)
                    return <td key={c}>{l ? <Ext href={l.explorerUrl}>{short(l.txHash)}</Ext> : DASH}</td>
                  })}
                </tr>
              ))}
            </Table>
          )}
          <p className="download">
            <a href={`${base}/bridges.csv`} download>
              Download all {countText(r.bridges.length)} bridges (CSV)
            </a>
          </p>
        </Section>

        <Section
          title="Disputes"
          subtitle={`${countText(r.disputes.length)} filed in the window, ${countText(closed)} closed`}
        >
          {r.disputes.length === 0 ? (
            <div className="empty empty--short">No disputes in the window</div>
          ) : (
            <Table head={["Case", "Filed", "Filed by", "Outcome", "Closed", "Transactions"]}>
              {r.disputes.map((d) => {
                const chain = d.filer ? chainOfAddress(d.filer) : null
                return (
                  <tr key={d.caseId}>
                    <td className="mono">{short(d.caseId)}</td>
                    <td className="when">{dayText(d.filedAt)}</td>
                    <td>
                      {roleText(d.filerRole)}
                      {d.filer && (
                        <>
                          {" "}
                          <Ext href={chain ? addressUrl(d.filer, chain) : null}>{short(d.filer)}</Ext>
                        </>
                      )}
                    </td>
                    <td>{outcomeLabel(d)}</td>
                    <td className="when">{d.closedAt ? dayText(d.closedAt) : DASH}</td>
                    <td>
                      {d.txs.length === 0 ? (
                        DASH
                      ) : (
                        <ul className="txs">
                          {d.txs.map((t) => (
                            <li key={`${t.chainId}:${t.txHash}:${t.kind}`}>
                              {kindText(t.kind)} <Ext href={t.explorerUrl}>{short(t.txHash)}</Ext>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )
              })}
            </Table>
          )}
          <p className="download">
            <a href={`${base}/disputes.csv`} download>
              Download the disputes (CSV)
            </a>
          </p>
        </Section>

        <Section title="Performance" subtitle="Medians, outcomes and volume are all time, from the network stats">
          <div className="stats stats--inset">
            <Metric label="Bridges completed (all time)" value={countText(all.completed)} hint="Settled cross-chain trades" />
            <Metric
              label="Proof generation (all time)"
              value={proveText(all.proving.medianProveMs)}
              hint="Median (p50) time to generate a settlement proof"
            />
            <Metric
              label="Settlement time (all time)"
              value={durationText(all.settlement.medianSeconds)}
              hint="Median (p50) from the maker's lock to the last leg confirmed"
            >
              {all.settlement.buckets.length > 0 && <SpeedBars buckets={all.settlement.buckets} />}
            </Metric>
          </div>
        </Section>

        <Section title="Daily bridges" subtitle="Completed per UTC day, inside the window">
          <DailyBars days={fillDaily(r.performance.daily, r.window.from, lastInstant(r.window.to))} />
        </Section>

        <div className="split">
          <div className="split__col">
            <Section title="Dispute outcomes (all time)" subtitle="By outcome, from the network stats">
              <ul className="rows">
                {disputeRows(all.disputes).map((row) => (
                  <li key={row.label} className={row.count === 0 ? "rows__zero" : undefined}>
                    <span>{row.label}</span>
                    <span>{countText(row.count)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
          <div className="split__col">
            <Section title="Volume per token (all time)" subtitle="Settled, in each token's own units">
              <ul className="rows">
                {all.volume.length === 0 && (
                  <li>
                    <span>No settled volume yet</span>
                  </li>
                )}
                {all.volume.map((v) => (
                  <li key={`${v.chainId}:${v.tokenId}`}>
                    <span>
                      {v.symbol} <span className="rows__sub">{chainName(v.chainId)}</span>
                    </span>
                    <span>{tokenAmount(v.amount, v.decimals)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>

        <Section title="Incidents" subtitle="Written by the team when the report was published">
          {notes.length === 0 ? (
            <p className="incidents__none">No incidents were recorded.</p>
          ) : (
            <div className="incidents">
              {notes.map((lines, i) => (
                <p key={i}>
                  {lines.map((line, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          )}
        </Section>

        <p className="footer">Report generated {timeText(r.generatedAt)} · Snapshot {s.id}</p>
        <Footer />
      </div>
    </>
  )
}
