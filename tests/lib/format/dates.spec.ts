import { test } from "node:test"
import assert from "node:assert/strict"
import { timeText, windowText } from "../../../src/lib/format/dates.ts"
import { DASH } from "../../../src/lib/format/text.ts"

test("the updated line is UTC", () => {
  assert.equal(timeText("2026-11-11T08:53:08.184Z"), "11 Nov 2026, 08:53 UTC")
  assert.equal(timeText("nope"), DASH)
})

test("a window with an exclusive end", () => {
  assert.equal(windowText("2026-10-26T00:00:00.000Z", "2026-11-10T00:00:00.000Z"), "26 Oct 2026 to 9 Nov 2026")
  assert.equal(
    windowText("2026-10-26T09:30:00Z", "2026-11-10T00:00:00Z"),
    "26 Oct 2026, 09:30 UTC to 10 Nov 2026, 00:00 UTC (not included)",
  )
})
