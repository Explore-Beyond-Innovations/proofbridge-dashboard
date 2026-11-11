// Two columns with hairlines, stacked on a phone.
export function Split({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="split">
      <div className="split__col">{left}</div>
      <div className="split__col">{right}</div>
    </div>
  )
}
