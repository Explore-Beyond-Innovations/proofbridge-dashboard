import { test } from "node:test"
import assert from "node:assert/strict"
import { kindText, paragraphs, short } from "../../../src/lib/format/text.ts"

test("incidents split into plain paragraphs on blank lines, text left as typed", () => {
  assert.deepEqual(paragraphs("One\nline two\n\n  \n\r\nThree <b>x</b>  \n"), [["One", "line two"], ["Three <b>x</b>"]])
  assert.deepEqual(paragraphs(null), [])
  assert.deepEqual(paragraphs("\n\n"), [])
})

test("short ids and tx kinds", () => {
  assert.equal(short("0xd2306c80a26fe4b63ff89fd55f736b17cd425bf0"), "0xd230…5bf0")
  assert.equal(short("case-1"), "case-1")
  assert.equal(kindText("dispute_filed"), "Dispute filed")
})
