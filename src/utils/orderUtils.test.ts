import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { generateOrderNumber, formatDateForDisplay } from "./orderUtils";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("orderUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set a fixed date for all tests: January 15, 2025
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("generateOrderNumber", () => {
    it("generates order number with correct format", () => {
      localStorageMock.getItem.mockReturnValue("0");
      
      const orderNumber = generateOrderNumber();
      
      expect(orderNumber).toBe("2025-01-15-001");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("order-count-2025-01-15", "1");
    });

    it("increments sequential number for same date", () => {
      localStorageMock.getItem
        .mockReturnValueOnce("5") // First call returns 5
        .mockReturnValueOnce("6"); // Second call returns 6
      
      const orderNumber1 = generateOrderNumber();
      const orderNumber2 = generateOrderNumber();
      
      expect(orderNumber1).toBe("2025-01-15-006");
      expect(orderNumber2).toBe("2025-01-15-007");
    });

    it("handles first order of the day", () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const orderNumber = generateOrderNumber();
      
      expect(orderNumber).toBe("2025-01-15-001");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("order-count-2025-01-15", "1");
    });

    it("pads sequential number with leading zeros", () => {
      localStorageMock.getItem.mockReturnValue("9");
      
      const orderNumber = generateOrderNumber();
      
      expect(orderNumber).toBe("2025-01-15-010");
    });

    it("handles large sequential numbers", () => {
      localStorageMock.getItem.mockReturnValue("999");
      
      const orderNumber = generateOrderNumber();
      
      expect(orderNumber).toBe("2025-01-15-1000");
    });
  });

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
