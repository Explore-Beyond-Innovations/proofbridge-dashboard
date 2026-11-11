// D2: the top bar's network links.
import { test } from "node:test"
import assert from "node:assert/strict"
import { switchLinks } from "../../../src/lib/network/switch.ts"

test("switchLinks: both networks in order, each its own URL, only the shown one current", () => {
  assert.deepEqual(switchLinks("testnet"), [
    { id: "testnet", label: "Testnet", href: "/testnet", current: true },
    { id: "mainnet", label: "Mainnet", href: "/mainnet", current: false },
  ])
  assert.deepEqual(
    switchLinks("mainnet").map((l) => [l.href, l.current]),
    [
      ["/testnet", false],
      ["/mainnet", true],
    ],
  )
})
