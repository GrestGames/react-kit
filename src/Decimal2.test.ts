import { describe, it, expect } from "vitest";
import { Decimal2 } from "./Decimal2";

describe("Decimal2", () => {
  it("stores and returns value", () => {
    expect(Decimal2.from(1.23).toNumber()).toBe(1.23);
  });

  it("add avoids floating-point drift", () => {
    expect(Decimal2.from(0.1).add(Decimal2.from(0.2)).toNumber()).toBe(0.3);
  });

  it("subtract works", () => {
    expect(Decimal2.from(1.0).subtract(Decimal2.from(0.25)).toNumber()).toBe(0.75);
  });

  it("toString formats to 2 decimals", () => {
    expect(Decimal2.from(5).toString()).toBe("5.00");
  });
});
