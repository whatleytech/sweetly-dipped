import { describe, it, expect } from "vitest";
import { formatDateForDisplay } from "./orderUtils";

describe("orderUtils", () => {
  describe("formatDateForDisplay", () => {
    it("formats date string correctly", () => {
      const formattedDate = formatDateForDisplay("2025-01-15");

      expect(formattedDate).toBe("January 15, 2025");
    });

    it("handles different date formats", () => {
      const formattedDate = formatDateForDisplay("2025-12-25");

      expect(formattedDate).toBe("December 25, 2025");
    });

    it("handles leap year dates", () => {
      const formattedDate = formatDateForDisplay("2024-02-29");

      expect(formattedDate).toBe("February 29, 2024");
    });
  });
});
