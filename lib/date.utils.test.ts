import { beforeEach, describe, expect, it } from "vitest";

import { getUserTimezone } from "./date.utils";

describe("getUserTimezone", () => {
  const originalIntl = globalThis.Intl;

  beforeEach(() => {
    // Restore original Intl before each test
    globalThis.Intl = originalIntl;
  });

  it("should return browser timezone when Intl is available (primary path)", () => {
    // Mock Intl with specific timezone
    globalThis.Intl = {
      DateTimeFormat: (() => ({
        resolvedOptions: () => ({ timeZone: "America/New_York" }),
      })) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("America/New_York");
  });

  it("should return UTC when Intl is unavailable", () => {
    // @ts-expect-error - Mocking Intl as undefined for testing
    delete globalThis.Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("UTC");
  });

  it("should return UTC when Intl.DateTimeFormat is not a function", () => {
    globalThis.Intl = {} as typeof Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("UTC");
  });

  it("should handle when resolvedOptions() throws an error", () => {
    globalThis.Intl = {
      DateTimeFormat: (() => {
        throw new Error("resolvedOptions failed");
      }) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("UTC");
  });

  it("should handle invalid timezone values", () => {
    // Test empty string
    globalThis.Intl = {
      DateTimeFormat: (() => ({
        resolvedOptions: () => ({ timeZone: "" }),
      })) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    expect(getUserTimezone()).toBe("UTC");

    // Test null (invalid case)
    globalThis.Intl = {
      DateTimeFormat: (() => ({
        resolvedOptions: () => ({ timeZone: null }),
      })) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    expect(getUserTimezone()).toBe("UTC");
  });

  it("should correctly detect various timezone regions", () => {
    const testTimezones = [
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Asia/Tokyo",
      "Australia/Sydney",
      "America/Sao_Paulo",
    ];

    testTimezones.forEach((testTz) => {
      globalThis.Intl = {
        DateTimeFormat: (() => ({
          resolvedOptions: () => ({ timeZone: testTz }),
        })) as unknown as typeof Intl.DateTimeFormat,
      } as typeof Intl;

      const timezone = getUserTimezone();
      expect(timezone).toBe(testTz);
      expect(typeof timezone).toBe("string");
    });
  });

  it("should use actual browser Intl API when available", () => {
    // Test with real Intl if available in test environment
    if (
      typeof originalIntl !== "undefined" &&
      typeof originalIntl.DateTimeFormat === "function"
    ) {
      globalThis.Intl = originalIntl;
      const timezone = getUserTimezone();

      expect(timezone).toBeTruthy();
      expect(typeof timezone).toBe("string");
      // Should be a valid IANA timezone format
      expect(timezone).toMatch(/^[A-Z][a-z]+\/[A-Z][a-z_]+(?:\/[A-Z][a-z_]+)?$/);
    }
  });
});

