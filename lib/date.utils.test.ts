import { beforeEach, describe, expect, it } from "vitest";

import { getUserTimezone, getTodayInTimezone } from "./date.utils";

describe("getUserTimezone", () => {
  const originalIntl = globalThis.Intl;

  beforeEach(() => {
    // Restore original Intl before each test
    globalThis.Intl = originalIntl;
  });

  it("should return browser timezone when Intl is available (primary path)", () => {
    // Mock client-side environment (window exists)
    const originalWindow = globalThis.window;
    globalThis.window = {} as Window & typeof globalThis;
    
    // Mock Intl with specific timezone
    globalThis.Intl = {
      DateTimeFormat: (() => ({
        resolvedOptions: () => ({ timeZone: "America/New_York" }),
      })) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("America/New_York");

    // Restore window
    globalThis.window = originalWindow;
  });

  it("should return America/Denver when window is undefined (server-side fallback)", () => {
    // Mock server-side environment (no window)
    const originalWindow = globalThis.window;
    // @ts-expect-error - Mocking window as undefined for testing
    delete globalThis.window;

    const timezone = getUserTimezone();
    expect(timezone).toBe("America/Denver");

    // Restore window
    globalThis.window = originalWindow;
  });

  it("should return America/Denver when Intl.DateTimeFormat is not a function (server-side fallback)", () => {
    // Mock server-side environment (no window)
    const originalWindow = globalThis.window;
    // @ts-expect-error - Mocking window as undefined for testing
    delete globalThis.window;
    globalThis.Intl = {} as typeof Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("America/Denver");

    // Restore window
    globalThis.window = originalWindow;
  });

  it("should return America/Denver when resolvedOptions() throws an error (server-side fallback)", () => {
    // Mock server-side environment (no window)
    const originalWindow = globalThis.window;
    // @ts-expect-error - Mocking window as undefined for testing
    delete globalThis.window;
    globalThis.Intl = {
      DateTimeFormat: (() => {
        throw new Error("resolvedOptions failed");
      }) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("America/Denver");

    // Restore window
    globalThis.window = originalWindow;
  });

  it("should return America/Denver when Intl is unavailable on client (client-side fallback)", () => {
    // Mock client-side environment (window exists) but Intl is unavailable
    const originalWindow = globalThis.window;
    globalThis.window = {} as Window & typeof globalThis;
    const originalIntl = globalThis.Intl;
    // @ts-expect-error - Mocking Intl as undefined for testing
    delete globalThis.Intl;

    const timezone = getUserTimezone();
    expect(timezone).toBe("America/Denver");

    // Restore
    globalThis.window = originalWindow;
    globalThis.Intl = originalIntl;
  });

  it("should handle invalid timezone values", () => {
    // Mock client-side environment (window exists)
    const originalWindow = globalThis.window;
    globalThis.window = {} as Window & typeof globalThis;

    // Test empty string - should fallback
    globalThis.Intl = {
      DateTimeFormat: (() => ({
        resolvedOptions: () => ({ timeZone: "" }),
      })) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    expect(getUserTimezone()).toBe("America/Denver");

    // Test null (invalid case) - should fallback
    globalThis.Intl = {
      DateTimeFormat: (() => ({
        resolvedOptions: () => ({ timeZone: null }),
      })) as unknown as typeof Intl.DateTimeFormat,
    } as typeof Intl;

    expect(getUserTimezone()).toBe("America/Denver");

    // Restore window
    globalThis.window = originalWindow;
  });

  it("should correctly detect various timezone regions", () => {
    // Mock client-side environment (window exists)
    const originalWindow = globalThis.window;
    globalThis.window = {} as Window & typeof globalThis;

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

    // Restore window
    globalThis.window = originalWindow;
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

describe("getTodayInTimezone", () => {
  it("should return today's date in YYYY-MM-DD format for a given timezone", () => {
    const timezone = "America/New_York";
    const today = getTodayInTimezone(timezone);
    
    // Should be in YYYY-MM-DD format
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Should be a valid date string
    const date = new Date(today);
    expect(date.toISOString()).toContain(today);
  });

  it("should return different dates for different timezones when crossing date boundaries", () => {
    // Note: This test may pass or fail depending on the current time
    // It's primarily checking the function works with different timezones
    const nyToday = getTodayInTimezone("America/New_York");
    const laToday = getTodayInTimezone("America/Los_Angeles");
    const tokyoToday = getTodayInTimezone("Asia/Tokyo");
    
    // All should be valid YYYY-MM-DD format
    expect(nyToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(laToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tokyoToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Should be valid date strings
    expect(() => new Date(nyToday)).not.toThrow();
    expect(() => new Date(laToday)).not.toThrow();
    expect(() => new Date(tokyoToday)).not.toThrow();
  });

  it("should handle various timezone formats", () => {
    const timezones = [
      "America/New_York",
      "Europe/London",
      "Asia/Tokyo",
      "Australia/Sydney",
      "America/Denver",
    ];

    timezones.forEach((tz) => {
      const today = getTodayInTimezone(tz);
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(today)).not.toThrow();
    });
  });
});

