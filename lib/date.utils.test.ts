import { beforeEach, describe, expect, it } from "vitest";

import { getUserTimezone } from "./date.utils";

describe("getUserTimezone", () => {
  // Store original values to restore after tests
  const originalWindow = globalThis.window;
  const originalIntl = globalThis.Intl;

  beforeEach(() => {
    // Restore original values before each test
    globalThis.window = originalWindow;
    globalThis.Intl = originalIntl;
  });

  it("should return 'America/Denver' when window is undefined (server environment)", () => {
    // Mock server environment
    // @ts-expect-error - dynamically removing window property for testing
    delete globalThis.window;

    const timezone = getUserTimezone();
    expect(timezone).toBe("America/Denver");
  });

  it("should return browser timezone when window and Intl are available (client environment)", () => {
    // Mock client environment with specific timezone
    // @ts-expect-error - Mocking window for testing
    globalThis.window = {};
    globalThis.Intl = {
      DateTimeFormat: (() => ({
        resolvedOptions: () => ({ timeZone: "America/New_York" }),
      })) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("America/New_York");
  });

  it("should return 'America/Denver' when Intl is undefined on client", () => {
    // Mock client with window but no Intl
    // @ts-expect-error - Mocking window for testing
    globalThis.window = {};
    // @ts-expect-error - dynamically removing Intl property for testing
    delete globalThis.Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("America/Denver");
  });

  it("should use actual browser Intl API when available in test environment", () => {
    // In jsdom environment, Intl should be available
    // @ts-expect-error - Mocking window for testing
    globalThis.window = {};

    // If Intl is actually available, use it
    if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      const actualTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timezone = getUserTimezone();

      // Should return a valid IANA timezone string
      expect(timezone).toBeTruthy();
      expect(typeof timezone).toBe("string");
      // In jsdom, it might return UTC, but the function should handle it correctly
      expect(timezone).toBe(actualTimezone);
    }
  });

  it("should handle different timezones correctly", () => {
    const testTimezones = [
      "America/Los_Angeles",
      "America/Chicago",
      "Europe/London",
      "Asia/Tokyo",
    ];

    testTimezones.forEach((testTz) => {
      // @ts-expect-error - Mocking window for testing
      globalThis.window = {};
      globalThis.Intl = {
        DateTimeFormat: (() => ({
          resolvedOptions: () => ({ timeZone: testTz }),
        })) as unknown as typeof Intl.DateTimeFormat,
      } as typeof Intl;

      const timezone = getUserTimezone();
      expect(timezone).toBe(testTz);
    });
  });

  it("should handle window being an object but Intl not having DateTimeFormat", () => {
    // @ts-expect-error - Mocking window for testing
    globalThis.window = {};
    // @ts-expect-error - Mocking Intl for testing
    globalThis.Intl = {};

    const timezone = getUserTimezone();
    // Should fallback since Intl.DateTimeFormat is not available
    expect(timezone).toBe("America/Denver");
  });

  it("should handle when resolvedOptions() throws an error", () => {
    // @ts-expect-error - Mocking window for testing
    globalThis.window = {};
    globalThis.Intl = {
      DateTimeFormat: (() => {
        throw new Error("resolvedOptions failed");
      }) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    // Should catch the error and return fallback
    const timezone = getUserTimezone();
    expect(timezone).toBe("America/Denver");
  });

  it("should handle when resolvedOptions() returns invalid timezone", () => {
    // @ts-expect-error - Mocking window for testing
    globalThis.window = {};
    globalThis.Intl = {
      DateTimeFormat: (() => ({
        resolvedOptions: () => ({ timeZone: "" }), // Empty string
      })) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    // Should fallback when timezone is invalid
    const timezone = getUserTimezone();
    expect(timezone).toBe("America/Denver");
  });

  it("should return a valid IANA timezone format", () => {
    const validTimezonePattern =
      /^[A-Z][a-z]+\/[A-Z][a-z_]+(?:\/[A-Z][a-z_]+)?$/;

    // Test with actual Intl if available (not mocked)
    // Restore original Intl for this test
    const testIntl = originalIntl;
    if (
      typeof testIntl !== "undefined" &&
      typeof testIntl.DateTimeFormat === "function"
    ) {
      // @ts-expect-error - Mocking window for testing
      globalThis.window = {};
      globalThis.Intl = testIntl;
      const timezone = getUserTimezone();
      // Should match IANA timezone format (e.g., "America/New_York", "Europe/London")
      expect(timezone).toMatch(validTimezonePattern);
    }
  });

  it("should handle multiple timezone regions correctly", () => {
    const regions = [
      "America/New_York", // Eastern Time
      "America/Los_Angeles", // Pacific Time
      "Europe/London", // GMT/BST
      "Asia/Tokyo", // JST
      "Australia/Sydney", // AEST
      "America/Sao_Paulo", // BRT
    ];

    regions.forEach((testTz) => {
      // @ts-expect-error - Mocking window for testing
      globalThis.window = {};
      globalThis.Intl = {
        DateTimeFormat: (() => ({
          resolvedOptions: () => ({ timeZone: testTz }),
        })) as unknown as typeof Intl.DateTimeFormat,
      } as typeof Intl;

      const timezone = getUserTimezone();
      expect(timezone).toBe(testTz);
      expect(typeof timezone).toBe("string");
      expect(timezone.length).toBeGreaterThan(0);
    });
  });
});

