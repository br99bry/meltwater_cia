import { describe, expect, it } from "vitest";

import { runPartOneDemo } from "../src/index.js";

describe("demo", () => {
  it("prints a runnable part 1 redaction example", () => {
    expect(runPartOneDemo()).toContain(
      "Redacted: XXXX analyst. The XXXX report mentioned XXXX, XXXX, and XXXX.",
    );
  });
});
