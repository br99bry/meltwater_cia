import { describe, expect, it } from "vitest";

import { KeywordParseError, parseKeywords } from "../src/index.js";

describe("parseKeywords", () => {
  it("parses unquoted keywords separated by spaces and commas", () => {
    expect(parseKeywords("Hello world, beer")).toEqual(["Hello", "world", "beer"]);
  });

  it("keeps quoted phrases as single keywords", () => {
    expect(parseKeywords("Hello world \"Boston Red Sox\", 'Pepperoni Pizza', beer")).toEqual([
      "Hello",
      "world",
      "Boston Red Sox",
      "Pepperoni Pizza",
      "beer",
    ]);
  });

  it("supports curly quotes from copied documents", () => {
    expect(parseKeywords("Hello world “Boston Red Sox”, ‘Cheese Pizza’, beer")).toEqual([
      "Hello",
      "world",
      "Boston Red Sox",
      "Cheese Pizza",
      "beer",
    ]);
  });

  it("ignores repeated separators and surrounding whitespace", () => {
    expect(parseKeywords("  beer,   wine,,  whiskey  ")).toEqual(["beer", "wine", "whiskey"]);
  });

  it("preserves punctuation inside quoted phrases", () => {
    expect(parseKeywords('"Node.js", "C++", "user@example.com"')).toEqual([
      "Node.js",
      "C++",
      "user@example.com",
    ]);
  });

  it("rejects unclosed quoted phrases", () => {
    expect(() => parseKeywords('"Boston Red Sox')).toThrow(KeywordParseError);
  });

  it("rejects adjacent quoted and unquoted tokens without a separator", () => {
    expect(() => parseKeywords('"Boston"Red')).toThrow(KeywordParseError);
  });
});
