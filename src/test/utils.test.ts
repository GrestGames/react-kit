import { describe, it, expect } from "vitest";
import { ArrayUtils } from "../util/ArrayUtils";
import { StringUtils } from "../util/StringUtils";
import { Decimal2 } from "../Decimal2";

describe("ArrayUtils", () => {
  it("removeElement removes the element", () => {
    expect(ArrayUtils.removeElement([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("removeElement returns array unchanged when element not found", () => {
    const arr = [1, 2, 3];
    expect(ArrayUtils.removeElement(arr, 99)).toBe(arr);
  });

  it("addIfNotExist adds missing element", () => {
    const arr = [1, 2];
    ArrayUtils.addIfNotExist(arr, 3);
    expect(arr).toContain(3);
  });

  it("addIfNotExist does not add duplicate", () => {
    const arr = [1, 2, 3];
    ArrayUtils.addIfNotExist(arr, 2);
    expect(arr.length).toBe(3);
  });

  it("arrayToHumanStr joins with commas and and", () => {
    expect(ArrayUtils.arrayToHumanStr(["a", "b", "c"])).toBe("a, b and c");
  });

  it("arrayToHumanStr single item", () => {
    expect(ArrayUtils.arrayToHumanStr(["x"])).toBe("x");
  });
});

describe("StringUtils", () => {
  it("lcFirst lowercases first char", () => {
    expect(StringUtils.lcFirst("Hello")).toBe("hello");
  });

  it("ucFirst uppercases first char", () => {
    expect(StringUtils.ucFirst("hello")).toBe("Hello");
  });
});

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
