// Explorer links and the address shapes they depend on.

/** An explorer URL only when it is plain https, so a bad row can't carry a javascript: link. */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).protocol === "https:" ? url : null
  } catch {
    return null
  }
}

/** An address's explorer page where the chain and format allow it (as the backoffice's format.ts). */
export function addressUrl(addr: string, chainId: string): string | null {
  if (chainId === "11155111") return /^0x[0-9a-fA-F]{40}$/.test(addr) ? `https://sepolia.etherscan.io/address/${addr}` : null
  if (chainId === "1000002") {
    if (/^G[A-Z2-7]{55}$/.test(addr)) return `https://stellar.expert/explorer/testnet/account/${addr}`
    if (/^C[A-Z2-7]{55}$/.test(addr)) return `https://stellar.expert/explorer/testnet/contract/${addr}`
  }
  return null // 32-byte hex on Stellar: account or contract is unknown
}

/** A case's filer comes without a chain, so read it from the address shape. */
export function chainOfAddress(addr: string): string | null {
  if (/^0x[0-9a-fA-F]{40}$/.test(addr)) return "11155111"
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(addr) || /^[GC][A-Z2-7]{55}$/.test(addr)) return "1000002"
  return null
}
