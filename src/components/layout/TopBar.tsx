import { Logo } from "./Logo"

// The mark and page title on the left, the status pill (children) on the right.
export function TopBar({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Logo />
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  )
}
