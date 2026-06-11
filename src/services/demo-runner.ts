import { parseKeywords } from "./keyword-parser.js";
import { redactDocument, redactDocumentWithKey, unredactDocument } from "../domain/redactor.js";

const DEMO_KEYWORDS = 'Hello world "Boston Red Sox", "Pepperoni Pizza", pizza, "New York", York, beer, C++';
const DEMO_DOCUMENT =
  "Hello analyst. The Boston Red Sox report mentioned Pepperoni Pizza in New York, beer, and C++.";
const DEMO_KEY = "demo-clearance-key";

export function runDemo(): string {
  const keywords = parseKeywords(DEMO_KEYWORDS);
  const redactedDocument = redactDocument(DEMO_DOCUMENT, keywords);
  const reversiblyRedactedDocument = redactDocumentWithKey(DEMO_DOCUMENT, keywords, DEMO_KEY);
  const unredactedDocument = unredactDocument(reversiblyRedactedDocument, DEMO_KEY);

  return [
    formatPartOneDemo(redactedDocument),
    "",
    "CIA Redaction Exercise - Part 2",
    "",
    `Key: ${DEMO_KEY}`,
    `Reversibly Redacted: ${reversiblyRedactedDocument}`,
    `Unredacted: ${unredactedDocument}`,
  ].join("\n");
}

function formatPartOneDemo(redactedDocument: string): string {
  return [
    "CIA Redaction Exercise - Part 1",
    "",
    `Keywords: ${DEMO_KEYWORDS}`,
    `Original: ${DEMO_DOCUMENT}`,
    `Redacted: ${redactedDocument}`,
  ].join("\n");
}
