import { describe, it, expect } from "vitest";
import { ArrayUtils } from "./ArrayUtils";

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
