import { describe, it, expect } from "vitest";
import { cn, slugify, calculateReadTime, formatDate, formatDateShort, truncate, timeAgo } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });
});

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World#")).toBe("hello-world");
  });

  it("replaces multiple spaces with single hyphen", () => {
    expect(slugify("Hello   World")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });

  it("handles underscores", () => {
    expect(slugify("hello_world")).toBe("hello-world");
  });
});

describe("calculateReadTime", () => {
  it("returns 1 for short content", () => {
    expect(calculateReadTime("Hello world")).toBe(1);
  });

  it("calculates read time based on 200 wpm", () => {
    const words = Array(400).fill("word").join(" ");
    expect(calculateReadTime(words)).toBe(2);
  });

  it("strips HTML tags before counting", () => {
    const html = "<p>Hello</p> <strong>world</strong>";
    expect(calculateReadTime(html)).toBe(1);
  });

  it("rounds up to next minute", () => {
    const words = Array(201).fill("word").join(" ");
    expect(calculateReadTime(words)).toBe(2);
  });
});

describe("formatDate", () => {
  it("formats a Date object to Indonesian locale", () => {
    const result = formatDate(new Date("2024-01-15"));
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("accepts string input", () => {
    const result = formatDate("2024-06-01");
    expect(result).toContain("2024");
  });
});

describe("formatDateShort", () => {
  it("formats date with short month", () => {
    const result = formatDateShort(new Date("2024-01-15"));
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });
});

describe("truncate", () => {
  it("returns original text if shorter than limit", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("truncates text and adds ellipsis", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("returns original text if exactly at limit", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });
});

describe("timeAgo", () => {
  it("returns 'Baru saja' for recent times", () => {
    const now = new Date();
    expect(timeAgo(now)).toBe("Baru saja");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinAgo)).toBe("5 menit lalu");
  });

  it("returns hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
    expect(timeAgo(threeHoursAgo)).toBe("3 jam lalu");
  });

  it("returns days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
    expect(timeAgo(twoDaysAgo)).toBe("2 hari lalu");
  });

  it("returns formatted date for older dates", () => {
    const oldDate = new Date(Date.now() - 30 * 86400 * 1000);
    const result = timeAgo(oldDate);
    // Should fall back to formatDateShort, not show "X hari lalu"
    expect(result).not.toContain("hari lalu");
  });
});
