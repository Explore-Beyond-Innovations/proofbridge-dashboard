export function Metric(props: { label: string; value: string; hint: string; children?: React.ReactNode }) {
  return (
    <div className="metric">
      <span className="metric__label">{props.label}</span>
      <span className="metric__value">{props.value}</span>
      <span className="metric__hint">{props.hint}</span>
      {props.children}
    </div>
  )
}
