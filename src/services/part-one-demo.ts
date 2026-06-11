import { parseKeywords } from "./keyword-parser.js";
import { redactDocument } from "./redactor.js";

const DEMO_KEYWORDS = 'Hello world "Boston Red Sox", "Pepperoni Pizza", beer, C++';
const DEMO_DOCUMENT =
  "Hello analyst. The Boston Red Sox report mentioned Pepperoni Pizza, beer, and C++.";

export function runPartOneDemo(): string {
  const keywords = parseKeywords(DEMO_KEYWORDS);
  const redactedDocument = redactDocument(DEMO_DOCUMENT, keywords);

  return [
    "CIA Redaction Exercise - Part 1",
    "",
    `Keywords: ${DEMO_KEYWORDS}`,
    `Original: ${DEMO_DOCUMENT}`,
    `Redacted: ${redactedDocument}`,
  ].join("\n");
}
