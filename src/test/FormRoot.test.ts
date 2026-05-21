import { describe, it, expect, vi } from "vitest";
import { FormRoot } from "../form/FormRoot";

describe("FormRoot", () => {
  it("clears loading state after sync init", () => {
    const root = new FormRoot(() => {}, {
      init: { name: "test" } as any,
      onSubmit: async () => {},
    });
    root.load();
    expect(root.isLoading()).toBe(false);
  });

  it("clears loading state after async init resolves", async () => {
    const root = new FormRoot(() => {}, {
      init: async () => ({ name: "async" }) as any,
      onSubmit: async () => {},
    });
    await root.load();
    expect(root.isLoading()).toBe(false);
  });

  it("clears loading state when async init rejects", async () => {
    const root = new FormRoot(() => {}, {
      init: async () => { throw new Error("fail"); },
      onSubmit: async () => {},
    });
    await root.load();
    expect(root.isLoading()).toBe(false);
  });

  it("starts in loading state before load is called", () => {
    const root = new FormRoot(() => {}, {
      init: async () => ({} as any),
      onSubmit: async () => {},
    });
    expect(root.isLoading()).toBe(true);
  });
});
