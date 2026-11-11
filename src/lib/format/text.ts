// Text both pages print: the dash for a missing value, short ids, labels from codes, typed notes.

export const DASH = "—"

export const short = (s: string) => (s.length > 13 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s)

/** "dispute_filed" → "Dispute filed". */
export const kindText = (k: string) => (k ? k[0].toUpperCase() + k.slice(1).replace(/_/g, " ") : k)

/** Typed incident notes as plain paragraphs: split on blank lines, lines inside one kept. */
export function paragraphs(text: string | null | undefined): string[][] {
  if (!text) return []
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((p) => p.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim() !== ""))
    .filter((lines) => lines.length > 0)
}
