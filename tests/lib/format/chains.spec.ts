import { test } from "node:test"
import assert from "node:assert/strict"
import { chainName } from "../../../src/lib/format/chains.ts"

test("known chains have names, others show their id", () => {
  assert.equal(chainName("11155111"), "Sepolia")
  assert.equal(chainName("1000002"), "Stellar testnet")
  assert.equal(chainName("42"), "chain 42")
})

test("a name the relayer gave wins over the known name", () => {
  assert.equal(chainName("11155111", "Ethereum Sepolia"), "Ethereum Sepolia")
  assert.equal(chainName("1000002", null), "Stellar testnet")
})
