export function Footer({ children }: { children: React.ReactNode }) {
  return <p className="footer">{children}</p>
}

// D5: the app link follows the network.
export function NetworkFooter({ appUrl }: { appUrl: string }) {
  return (
    <Footer>
      Track the live bridge at <a href={appUrl}>{new URL(appUrl).host}</a> · Read the docs at{" "}
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
