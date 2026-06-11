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

Prints a minimal hello-world message. The redaction and unredaction implementation will be added incrementally.

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
