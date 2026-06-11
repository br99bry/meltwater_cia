import { describe, expect, it } from "vitest";

import { redactDocument } from "../src/index.js";

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
