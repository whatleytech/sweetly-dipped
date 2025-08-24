import { describe, it, expect } from "vitest";
import { 
  generatePackageSummary, 
  generateByDozenBreakdown, 
  generatePickupSummary 
} from "./packageSummaryUtils";
import type { FormData } from "../types/formTypes";

describe("packageSummaryUtils", () => {
  describe("generatePackageSummary", () => {
    it("returns package label for regular packages", () => {
      const formData: Partial<FormData> = {
        packageType: "medium",
      } as FormData;
      
      const summary = generatePackageSummary(formData as FormData);
      
      expect(summary).toBe("Medium (5 dozen – 60 treats)");
    });

    it("returns custom order summary for by-dozen packages", () => {
      const formData: Partial<FormData> = {
        packageType: "by-dozen",
        riceKrispies: 2,
        oreos: 1,
        pretzels: 0,
        marshmallows: 0,
      } as FormData;
      
      const summary = generatePackageSummary(formData as FormData);
      
      expect(summary).toBe("Custom Order (3 dozen)");
    });

    it("returns 'No treats selected' for by-dozen with zero quantities", () => {
      const formData: Partial<FormData> = {
        packageType: "by-dozen",
        riceKrispies: 0,
        oreos: 0,
        pretzels: 0,
        marshmallows: 0,
      } as FormData;
      
      const summary = generatePackageSummary(formData as FormData);
      
      expect(summary).toBe("No treats selected");
    });

    it("returns 'Package not specified' for invalid package type", () => {
      const formData: Partial<FormData> = {
        packageType: "invalid-type" as FormData["packageType"],
      } as FormData;
      
      const summary = generatePackageSummary(formData as FormData);
      
      expect(summary).toBe("Package not specified");
    });
  });

  describe("generateByDozenBreakdown", () => {
    it("returns breakdown for all treat types", () => {
      const formData: Partial<FormData> = {
        riceKrispies: 2,
        oreos: 1,
        pretzels: 3,
        marshmallows: 1,
      } as FormData;
      
      const breakdown = generateByDozenBreakdown(formData as FormData);
      
      expect(breakdown).toEqual([
        "2 dozen Chocolate covered Rice Krispies",
        "1 dozen Chocolate covered Oreos",
        "3 dozen Chocolate dipped pretzels",
        "1 dozen Chocolate covered marshmallow pops",
      ]);
    });

    it("returns breakdown for partial treat types", () => {
      const formData: Partial<FormData> = {
        riceKrispies: 0,
        oreos: 2,
        pretzels: 0,
        marshmallows: 1,
      } as FormData;
      
      const breakdown = generateByDozenBreakdown(formData as FormData);
      
      expect(breakdown).toEqual([
        "2 dozen Chocolate covered Oreos",
        "1 dozen Chocolate covered marshmallow pops",
      ]);
    });

    it("returns empty array for zero quantities", () => {
      const formData: Partial<FormData> = {
        riceKrispies: 0,
        oreos: 0,
        pretzels: 0,
        marshmallows: 0,
      } as FormData;
      
      const breakdown = generateByDozenBreakdown(formData as FormData);
      
      expect(breakdown).toEqual([]);
    });
  });

  describe("generatePickupSummary", () => {
    it("formats pickup details correctly", () => {
      const formData: Partial<FormData> = {
        pickupDate: "2025-01-15",
        pickupTime: "8:30 AM",
      } as FormData;
      
      const summary = generatePickupSummary(formData as FormData);
      
      expect(summary).toBe("Pickup: January 15, 2025 at 8:30 AM");
    });

    it("handles different date formats", () => {
      const formData: Partial<FormData> = {
        pickupDate: "2025-12-25",
        pickupTime: "5:00 PM",
      } as FormData;
      
      const summary = generatePickupSummary(formData as FormData);
      
      expect(summary).toBe("Pickup: December 25, 2025 at 5:00 PM");
    });

    it("returns 'Pickup details not specified' when date is missing", () => {
      const formData: Partial<FormData> = {
        pickupDate: "",
        pickupTime: "8:30 AM",
      } as FormData;
      
      const summary = generatePickupSummary(formData as FormData);
      
      expect(summary).toBe("Pickup details not specified");
    });

    it("returns 'Pickup details not specified' when time is missing", () => {
      const formData: Partial<FormData> = {
        pickupDate: "2025-01-15",
        pickupTime: "",
      } as FormData;
      
      const summary = generatePickupSummary(formData as FormData);
      
      expect(summary).toBe("Pickup details not specified");
    });

    it("returns 'Pickup details not specified' when both are missing", () => {
      const formData: Partial<FormData> = {
        pickupDate: "",
        pickupTime: "",
      } as FormData;
      
      const summary = generatePickupSummary(formData as FormData);
      
      expect(summary).toBe("Pickup details not specified");
    });
  });
});
