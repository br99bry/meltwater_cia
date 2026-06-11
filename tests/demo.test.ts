import { describe, expect, it } from "vitest";

import { runDemo } from "../src/index.js";

describe("demo", () => {
  it("prints a runnable part 1 redaction example", () => {
    expect(runDemo()).toContain(
      "Redacted: XXXX analyst. The XXXX report mentioned XXXX in XXXX, XXXX, and XXXX.",
    );
  });

  it("prints a runnable part 2 unredaction example", () => {
    const demoOutput = runDemo();

    expect(demoOutput).toContain("CIA Redaction Exercise - Part 2");
    expect(demoOutput).toContain("Reversibly Redacted: XXXX[cia:v1:");
    expect(demoOutput).toContain(
      "Unredacted: Hello analyst. The Boston Red Sox report mentioned Pepperoni Pizza in New York, beer, and C++.",
    );
  });
});
