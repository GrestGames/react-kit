import { describe, it, expect } from "vitest";
import { StringUtils } from "./StringUtils";

describe("StringUtils", () => {
  it("lcFirst lowercases first char", () => {
    expect(StringUtils.lcFirst("Hello")).toBe("hello");
  });

  it("ucFirst uppercases first char", () => {
    expect(StringUtils.ucFirst("hello")).toBe("Hello");
  });
});
