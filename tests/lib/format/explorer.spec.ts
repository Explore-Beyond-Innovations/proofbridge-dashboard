import { test } from "node:test"
import assert from "node:assert/strict"
import { addressUrl, safeUrl } from "../../../src/lib/format/explorer.ts"

test("explorer links must be https; addresses link only in a known shape", () => {
  assert.equal(safeUrl("https://sepolia.etherscan.io/tx/0x1"), "https://sepolia.etherscan.io/tx/0x1")
  assert.equal(safeUrl("javascript:alert(1)"), null)
  assert.equal(safeUrl("http://example.com"), null)
  assert.equal(safeUrl(null), null)
  assert.equal(
    addressUrl("0xd2306c80a26fe4b63ff89fd55f736b17cd425bf0", "11155111"),
    "https://sepolia.etherscan.io/address/0xd2306c80a26fe4b63ff89fd55f736b17cd425bf0",
  )
  assert.equal(addressUrl("ab".repeat(32), "1000002"), null)
  assert.equal(addressUrl(`G${"A".repeat(55)}`, "1000002"), `https://stellar.expert/explorer/testnet/account/G${"A".repeat(55)}`)
})
