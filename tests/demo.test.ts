import { describe, expect, it } from "vitest";

import { getGreeting } from "../src/index.js";

describe("demo", () => {
  it("returns the initial greeting", () => {
    expect(getGreeting()).toBe("Hello from the Meltwater CIA redaction demo.");
  });
});
