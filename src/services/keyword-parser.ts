export class KeywordParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KeywordParseError";
  }
}

export function parseKeywords(input: string): string[] {
  const keywords: string[] = [];
  let current = "";
  let activeQuote: '"' | "'" | null = null;
  let justClosedQuote = false;

  for (const rawCharacter of input) {
    const character = normalizeQuote(rawCharacter);

    if (activeQuote !== null) {
      if (character === activeQuote) {
        pushKeyword(keywords, current);
        current = "";
        activeQuote = null;
        justClosedQuote = true;
        continue;
      }

      current += rawCharacter;
      continue;
    }

    if (isSeparator(character)) {
      pushKeyword(keywords, current);
      current = "";
      justClosedQuote = false;
      continue;
    }

    if (isQuote(character)) {
      if (current.trim().length > 0) {
        throw new KeywordParseError("Quoted phrases must be separated from unquoted keywords.");
      }

      activeQuote = character;
      current = "";
      justClosedQuote = false;
      continue;
    }

    if (justClosedQuote) {
      throw new KeywordParseError("Quoted phrases must be followed by a separator.");
    }

    current += rawCharacter;
  }

  if (activeQuote !== null) {
    throw new KeywordParseError("Unclosed quoted phrase in keyword input.");
  }

  pushKeyword(keywords, current);

  return keywords;
}

function pushKeyword(keywords: string[], value: string): void {
  const keyword = value.trim();

  if (keyword.length > 0) {
    keywords.push(keyword);
  }
}

function normalizeQuote(character: string): string {
  if (character === "“" || character === "”") {
    return '"';
  }

  if (character === "‘" || character === "’") {
    return "'";
  }

  return character;
}

function isQuote(character: string): character is '"' | "'" {
  return character === '"' || character === "'";
}

function isSeparator(character: string): boolean {
  return character === "," || /\s/.test(character);
}
