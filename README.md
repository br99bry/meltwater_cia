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

Runs a small Part 1 example that parses keywords and redacts matching document text with `XXXX`.

## Project Structure

```text
src/
  cli/
  domain/
  services/
  types/
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
