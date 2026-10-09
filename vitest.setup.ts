import "@testing-library/jest-dom/vitest";

// jsdom ships no IntersectionObserver; components that lazy-load on scroll need one.
globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
} as unknown as typeof IntersectionObserver;
