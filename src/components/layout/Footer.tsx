export function Footer({ children }: { children: React.ReactNode }) {
  return <p className="footer">{children}</p>
}

export function NetworkFooter() {
  return (
    <Footer>
      Track the live bridge at <a href="https://app.pfbridge.xyz">app.pfbridge.xyz</a> · Read the docs at{" "}
      <a href="https://docs.pfbridge.xyz">docs.pfbridge.xyz</a> · Follow on{" "}
      <a href="https://github.com/Explore-Beyond-Innovations/ProofBridge">GitHub</a>.
    </Footer>
  )
}

export function SoakFooter() {
  return (
    <Footer>
      See the live network stats at <a href="/">dashboard.pfbridge.xyz</a> · Read the docs at{" "}
      <a href="https://docs.pfbridge.xyz">docs.pfbridge.xyz</a>.
    </Footer>
  )
}
