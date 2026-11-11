export function Section(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div>
        <h2 className="section__title">{props.title}</h2>
        {props.subtitle && <p className="section__sub">{props.subtitle}</p>}
      </div>
      {props.children}
    </section>
  )
}
