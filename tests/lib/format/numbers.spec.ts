// Counts, rates, durations and token amounts.
import { test } from "node:test"
import assert from "node:assert/strict"
import { completionText, countText, durationText, proveText, tokenAmount } from "../../../src/lib/format/numbers.ts"
import { DASH } from "../../../src/lib/format/text.ts"

test("counts are grouped, a missing count is a dash", () => {
  assert.equal(countText(154), "154")
  assert.equal(countText(12345), "12,345")
  assert.equal(countText(0), "0")
  assert.equal(countText(undefined), DASH)
})

test("completion rate is a percentage to one place; null means nothing has ended", () => {
  assert.equal(completionText(0.5946), "59.5%")
  assert.equal(completionText(1), "100.0%")
  assert.equal(completionText(0), "0.0%")
  assert.equal(completionText(null), "none ended yet")
})

test("proof time is ms under a second, seconds to one place above", () => {
  assert.equal(proveText(845), "845 ms")
  assert.equal(proveText(999.4), "999 ms")
  assert.equal(proveText(1000), "1.0 s")
  assert.equal(proveText(28400), "28.4 s")
  assert.equal(proveText(null), DASH)
})

test("durations read as s, m+s, h+m", () => {
  assert.equal(durationText(45), "45s")
  assert.equal(durationText(109), "1m49s")
  assert.equal(durationText(3599), "59m59s")
  assert.equal(durationText(3600), "1h00m")
  assert.equal(durationText(7505), "2h05m")
  assert.equal(durationText(null), DASH)
})

test("token amounts use the token's decimals, exactly, cut to two places", () => {
  assert.equal(tokenAmount("491010000000", 7), "49,101")
  assert.equal(tokenAmount("655957000000000000000000", 18), "655,957")
  assert.equal(tokenAmount("74000000000", 7), "7,400")
  assert.equal(tokenAmount("1259", 3), "1.25")
  assert.equal(tokenAmount("5", 2), "0.05")
  assert.equal(tokenAmount("0", 18), "0")
  assert.equal(tokenAmount("123456789012345678901234567890", 0), "123,456,789,012,345,678,901,234,567,890")
  assert.equal(tokenAmount("-1", 2), DASH)
})
