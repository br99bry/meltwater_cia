# CIA Redaction Exercise

Node.js + TypeScript implementation for Meltwater's technical evaluation.

The project is intentionally structured as a small domain library with a runnable demo.

## Requirements

- Node.js 20+
- npm

## Scripts

```bash
npm run demo
npm test
npm run lint
npm run build
npm run check
```

## Current Demo

```bash
npm run demo
```

Runs a small Part 1 and Part 2 example that parses keywords, redacts matching document text, then restores reversible redactions with a key.

## Project Structure

```text
src/
  cli/       runnable demo entrypoint
  domain/    redaction and unredaction rules
  services/  keyword parsing and demo orchestration
tests/
```

## Design Direction

The assessment asks for a program that can be demoed, so the initial delivery focuses on a command-line demo backed by testable application code. The core redaction logic should stay independent from console I/O so it can later be exposed through an API or background worker if needed.

## Current Assumptions

- Keywords can be separated by commas, whitespace, or both.
- Quoted phrases are treated as a single keyword.
- Straight and curly quotes are accepted as phrase delimiters.
- Malformed quoted input fails fast instead of being parsed ambiguously.
- Redaction matching is case-sensitive because the exercise does not define case folding rules.
- Keywords and phrases are matched literally, not as regular expressions.
- Redacted text is replaced with the fixed token `XXXX`; the replacement does not preserve the original text length.
- When matches overlap, the longest match wins. This keeps phrases like `Pepperoni Pizza` from being partially redacted as `pizza`.

## Reversible Redaction

Part 2 keeps the Part 1 behavior intact and adds separate reversible functions. This avoids changing the meaning of the plain `XXXX` redaction output.

Reversible redactions are embedded in the document as versioned tokens:

```text
XXXX[cia:v1:<payload>]
```

The payload contains the original text encrypted with Node's built-in AES-256-GCM support. The exercise does not require production-grade cryptography, but authenticated encryption avoids exposing the removed text as plain Base64 and lets the program reject tokens that were created with a different key or were modified.

Additional assumptions:

- Unredaction receives only a key and the redacted document, so reversible metadata is stored in-band instead of in an external database.
- Reversible redaction requires a non-empty key.
- Plain `XXXX` tokens from Part 1 are left unchanged by unredaction.
- Incorrect keys or malformed reversible tokens fail with `UnredactionError`.
