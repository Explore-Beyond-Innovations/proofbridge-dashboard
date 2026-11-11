import { safeUrl } from "@/lib/format/explorer"

// Opens explorers in a new tab; a missing or non-https URL shows the text alone.
export function ExternalLink({ href, children }: { href: string | null | undefined; children: React.ReactNode }) {
  const url = safeUrl(href)
  if (!url) return <span className="mono">{children}</span>
  return (
    <a className="mono" href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
