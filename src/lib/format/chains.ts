const CHAIN_NAMES: Record<string, string> = {
  "11155111": "Sepolia",
  "1000002": "Stellar testnet",
  "1000001": "Stellar local",
}

/** The name the relayer gave, else a known chain's name, else "chain <id>". */
export const chainName = (chainId: string, given?: string | null) => given || (CHAIN_NAMES[chainId] ?? `chain ${chainId}`)
