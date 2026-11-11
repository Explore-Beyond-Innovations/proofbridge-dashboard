import { Section } from "@/components/ui/Section"

// The team's notes as plain paragraphs (never HTML), lines kept with <br>.
export function Incidents({ notes }: { notes: string[][] }) {
  return (
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
  )
}
