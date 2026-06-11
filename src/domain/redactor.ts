import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const REDACTION_TOKEN = "XXXX";
const REVERSIBLE_TOKEN_PREFIX = `${REDACTION_TOKEN}[cia:v1:`;
const REVERSIBLE_TOKEN_PATTERN = /XXXX\[cia:v1:([A-Za-z0-9_-]+)\]/g;
const ENCRYPTION_ALGORITHM = "aes-256-gcm";

type RedactionRange = {
  start: number;
  end: number;
};

type RedactionMatch = RedactionRange & {
  text: string;
};

type EncryptedPayload = {
  iv: string;
  ciphertext: string;
  tag: string;
};

export class UnredactionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnredactionError";
  }
}

export function redactDocument(documentText: string, keywords: string[]): string {
  const matches = findRedactionMatches(documentText, keywords);

  return applyRedactions(documentText, matches, () => REDACTION_TOKEN);
}

export function redactDocumentWithKey(documentText: string, keywords: string[], key: string): string {
  assertValidKey(key);

  const matches = findRedactionMatches(documentText, keywords);

  return applyRedactions(documentText, matches, (match) => createReversibleToken(match.text, key));
}

export function unredactDocument(documentText: string, key: string): string {
  assertValidKey(key);

  return documentText.replace(REVERSIBLE_TOKEN_PATTERN, (_token, encodedPayload: string) =>
    decryptPayload(encodedPayload, key),
  );
}

function findRedactionMatches(documentText: string, keywords: string[]): RedactionMatch[] {
  const uniqueKeywords = [...new Set(keywords.filter((keyword) => keyword.length > 0))];
  const matches = uniqueKeywords.flatMap((keyword) => findKeywordRanges(documentText, keyword));
  const ranges = selectNonOverlappingRanges(matches);

  return ranges.map((range) => ({
    ...range,
    text: documentText.slice(range.start, range.end),
  }));
}

function applyRedactions(
  documentText: string,
  matches: RedactionMatch[],
  createReplacement: (match: RedactionMatch) => string,
): string {
  if (matches.length === 0) {
    return documentText;
  }

  let redactedText = "";
  let cursor = 0;

  for (const match of matches) {
    redactedText += documentText.slice(cursor, match.start);
    redactedText += createReplacement(match);
    cursor = match.end;
  }

  return redactedText + documentText.slice(cursor);
}

function findKeywordRanges(documentText: string, keyword: string): RedactionRange[] {
  const ranges: RedactionRange[] = [];
  let searchFrom = 0;

  while (searchFrom < documentText.length) {
    const start = documentText.indexOf(keyword, searchFrom);

    if (start === -1) {
      break;
    }

    const end = start + keyword.length;
    ranges.push({ start, end });
    searchFrom = end;
  }

  return ranges;
}

function selectNonOverlappingRanges(ranges: RedactionRange[]): RedactionRange[] {
  const selectedRanges: RedactionRange[] = [];
  const rangesByPriority = [...ranges].sort((left, right) => {
    const lengthDifference = getRangeLength(right) - getRangeLength(left);

    if (lengthDifference !== 0) {
      return lengthDifference;
    }

    return left.start - right.start;
  });

  for (const range of rangesByPriority) {
    if (!selectedRanges.some((selectedRange) => rangesOverlap(range, selectedRange))) {
      selectedRanges.push(range);
    }
  }

  return selectedRanges.sort((left, right) => left.start - right.start);
}

function getRangeLength(range: RedactionRange): number {
  return range.end - range.start;
}

function rangesOverlap(left: RedactionRange, right: RedactionRange): boolean {
  return left.start < right.end && right.start < left.end;
}

function assertValidKey(key: string): void {
  if (key.trim().length === 0) {
    throw new RangeError("Redaction key must not be empty.");
  }
}

function createReversibleToken(text: string, key: string): string {
  const payload = encryptText(text, key);

  return `${REVERSIBLE_TOKEN_PREFIX}${encodePayload(payload)}]`;
}

function encryptText(text: string, key: string): EncryptedPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, deriveKey(key), iv);
  const ciphertext = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    tag: tag.toString("base64url"),
  };
}

function decryptPayload(encodedPayload: string, key: string): string {
  try {
    const payload = decodePayload(encodedPayload);
    const decipher = createDecipheriv(
      ENCRYPTION_ALGORITHM,
      deriveKey(key),
      Buffer.from(payload.iv, "base64url"),
    );

    decipher.setAuthTag(Buffer.from(payload.tag, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(payload.ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new UnredactionError("Unable to unredact document with the provided key.");
  }
}

function deriveKey(key: string): Buffer {
  return createHash("sha256").update(key).digest();
}

function encodePayload(payload: EncryptedPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encodedPayload: string): EncryptedPayload {
  const value: unknown = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

  if (!isEncryptedPayload(value)) {
    throw new Error("Invalid reversible redaction payload.");
  }

  return value;
}

function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.iv === "string" &&
    typeof payload.ciphertext === "string" &&
    typeof payload.tag === "string"
  );
}
