type Props = { tone: "ok"; text: string; time: string } | { tone: "warn"; text: string }

// ok: "<text> <time>" by a green dot; warn: the text alone, amber. Kept as two text nodes, as the pages always had.
export function StatusPill(props: Props) {
  if (props.tone === "warn")
    return (
      <span className="pill pill--warn">
        <span className="dot dot--warn" aria-hidden />
        {props.text}
      </span>
    )
  return (
    <span className="pill">
      <span className="dot dot--ok" aria-hidden />
      {`${props.text} `}
      {props.time}
    </span>
  )
}
