import { describe, expect, it } from "vitest";

import {
  redactDocument,
  redactDocumentWithKey,
  unredactDocument,
  UnredactionError,
} from "../src/index.js";

describe("redactDocument", () => {
  it("replaces matching keywords with the redaction token", () => {
    expect(redactDocument("I drank beer yesterday.", ["beer"])).toBe("I drank XXXX yesterday.");
  });

  it("redacts quoted phrases after they have been parsed as keywords", () => {
    expect(redactDocument("The Boston Red Sox won.", ["Boston Red Sox"])).toBe("The XXXX won.");
  });

  it("redacts multiple occurrences of the same keyword", () => {
    expect(redactDocument("beer, wine, beer", ["beer"])).toBe("XXXX, wine, XXXX");
  });

  it("keeps the original document when there are no keyword matches", () => {
    expect(redactDocument("Nothing classified here.", ["beer"])).toBe("Nothing classified here.");
  });

  it("handles empty keyword lists", () => {
    expect(redactDocument("Nothing classified here.", [])).toBe("Nothing classified here.");
  });

  it("matches keywords case-sensitively by default", () => {
    expect(redactDocument("I drank Beer yesterday.", ["beer"])).toBe("I drank Beer yesterday.");
  });

  it("treats keyword punctuation literally", () => {
    expect(redactDocument("C++ and Node.js are listed.", ["C++", "Node.js"])).toBe(
      "XXXX and XXXX are listed.",
    );
  });

  it("prefers the longest keyword when matches start at the same position", () => {
    expect(redactDocument("I like pepperoni pizza.", ["pizza", "pepperoni pizza"])).toBe(
      "I like XXXX.",
    );
  });

  it("prefers the longest phrase when keyword matches overlap", () => {
    expect(redactDocument("I live in New York.", ["New York", "York"])).toBe("I live in XXXX.");
  });
});

describe("reversible redaction", () => {
  it("redacts and unredacts a document with the provided key", () => {
    const documentText = "I drank beer yesterday.";
    const redactedDocument = redactDocumentWithKey(documentText, ["beer"], "demo-key");

    expect(redactedDocument).toMatch(/^I drank XXXX\[cia:v1:[A-Za-z0-9_-]+\] yesterday\.$/);
    expect(redactedDocument).not.toContain("beer");
    expect(unredactDocument(redactedDocument, "demo-key")).toBe(documentText);
  });

  it("supports multiple reversible redactions in the same document", () => {
    const documentText = "Beer and C++ were in the report.";
    const redactedDocument = redactDocumentWithKey(documentText, ["Beer", "C++"], "demo-key");

    expect(redactedDocument.match(/XXXX\[cia:v1:/g)).toHaveLength(2);
    expect(unredactDocument(redactedDocument, "demo-key")).toBe(documentText);
  });

  it("reuses the same overlap handling as regular redaction", () => {
    const documentText = "I like pepperoni pizza.";
    const redactedDocument = redactDocumentWithKey(
      documentText,
      ["pizza", "pepperoni pizza"],
      "demo-key",
    );

    expect(redactedDocument.match(/XXXX\[cia:v1:/g)).toHaveLength(1);
    expect(unredactDocument(redactedDocument, "demo-key")).toBe(documentText);
  });

  it("leaves non-reversible redaction tokens unchanged", () => {
    expect(unredactDocument("This was XXXX already.", "demo-key")).toBe("This was XXXX already.");
  });

  it("rejects reversible tokens when the key is incorrect", () => {
    const redactedDocument = redactDocumentWithKey("The code word is falcon.", ["falcon"], "right");

    expect(() => unredactDocument(redactedDocument, "wrong")).toThrow(UnredactionError);
  });

  it("rejects empty reversible redaction keys", () => {
    expect(() => redactDocumentWithKey("The code word is falcon.", ["falcon"], "")).toThrow(
      RangeError,
    );
    expect(() => unredactDocument("This was XXXX already.", "   ")).toThrow(RangeError);
  });

  it("rejects malformed reversible payloads", () => {
    expect(() => unredactDocument("The code word is XXXX[cia:v1:broken].", "demo-key")).toThrow(
      UnredactionError,
    );
  });
});
