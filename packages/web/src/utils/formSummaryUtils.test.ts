import { describe, it, expect } from "vitest";
import { getStepSummary } from "./formSummaryUtils";
import type { FormData } from '@sweetly-dipped/shared-types';

const mockFormData: FormData = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "123-456-7890",
  communicationMethod: "email",
  packageType: "medium",
  riceKrispies: 2,
  oreos: 1,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: "Pink and Gold",
  eventType: "Birthday Party",
  theme: "Princess",
  selectedAdditionalDesigns: [],
  pickupDate: "2024-01-15",
  pickupTime: "5:00 PM",
  rushOrder: false,
  referralSource: "",
  termsAccepted: false,
  visitedSteps: new Set(),
};

describe("formSummaryUtils", () => {
  describe("getStepSummary", () => {
    describe("lead step", () => {
      it("returns full name when both first and last name are provided", () => {
        expect(getStepSummary("lead", mockFormData)).toBe("John Doe");
      });

      it("returns email when no name is provided", () => {
        const formData = { ...mockFormData, firstName: "", lastName: "" };
        expect(getStepSummary("lead", formData)).toBe("john@example.com");
      });

      it("returns 'Contact info provided' when only phone is provided", () => {
        const formData = { ...mockFormData, firstName: "", lastName: "", email: "" };
        expect(getStepSummary("lead", formData)).toBe("Contact info provided");
      });

      it("returns null when no contact info is provided", () => {
        const formData = { ...mockFormData, firstName: "", lastName: "", email: "", phone: "" };
        expect(getStepSummary("lead", formData)).toBeNull();
      });
    });

    describe("communication step", () => {
      it("returns 'Email' for email communication method", () => {
        expect(getStepSummary("communication", mockFormData)).toBe("Email");
      });

      it("returns 'Text' for text communication method", () => {
        const formData: FormData = { ...mockFormData, communicationMethod: "text" };
        expect(getStepSummary("communication", formData)).toBe("Text");
      });

      it("returns null when no communication method is selected", () => {
        const formData: FormData = { ...mockFormData, communicationMethod: "" };
        expect(getStepSummary("communication", formData)).toBeNull();
      });
    });

    describe("package step", () => {
      it("returns correct package name for small package", () => {
        const formData: FormData = { ...mockFormData, packageType: "small" };
        expect(getStepSummary("package", formData)).toBe("Small Package (3 dozen)");
      });

      it("returns correct package name for medium package", () => {
        expect(getStepSummary("package", mockFormData)).toBe("Medium Package (5 dozen)");
      });

      it("returns correct package name for large package", () => {
        const formData: FormData = { ...mockFormData, packageType: "large" };
        expect(getStepSummary("package", formData)).toBe("Large Package (8 dozen)");
      });

      it("returns correct package name for xl package", () => {
        const formData: FormData = { ...mockFormData, packageType: "xl" };
        expect(getStepSummary("package", formData)).toBe("XL Package (12 dozen)");
      });

      it("returns correct package name for by-dozen package", () => {
        const formData: FormData = { ...mockFormData, packageType: "by-dozen" };
        expect(getStepSummary("package", formData)).toBe("By The Dozen");
      });

      it("returns null when no package type is selected", () => {
        const formData: FormData = { ...mockFormData, packageType: "" };
        expect(getStepSummary("package", formData)).toBeNull();
      });
    });

    describe("by-dozen step", () => {
      it("returns summary of selected items when package type is by-dozen", () => {
        const formData: FormData = { ...mockFormData, packageType: "by-dozen" };
        expect(getStepSummary("by-dozen", formData)).toBe("2 Rice Krispies, 1 Oreos");
      });

      it("returns null when package type is not by-dozen", () => {
        expect(getStepSummary("by-dozen", mockFormData)).toBeNull();
      });

      it("returns null when no items are selected", () => {
        const formData: FormData = {
          ...mockFormData,
          packageType: "by-dozen",
          riceKrispies: 0,
          oreos: 0,
          pretzels: 0,
          marshmallows: 0,
        };
        expect(getStepSummary("by-dozen", formData)).toBeNull();
      });

      it("includes all selected items in summary", () => {
        const formData: FormData = {
          ...mockFormData,
          packageType: "by-dozen",
          riceKrispies: 3,
          oreos: 2,
          pretzels: 1,
          marshmallows: 4,
        };
        expect(getStepSummary("by-dozen", formData)).toBe(
          "3 Rice Krispies, 2 Oreos, 1 Pretzels, 4 Marshmallows"
        );
      });
    });

    describe("color step", () => {
      it("returns color scheme when provided", () => {
        expect(getStepSummary("color", mockFormData)).toBe("Pink and Gold");
      });

      it("returns null when no color scheme is selected", () => {
        const formData = { ...mockFormData, colorScheme: "" };
        expect(getStepSummary("color", formData)).toBeNull();
      });
    });

    describe("event step", () => {
      it("returns event type and theme when both are provided", () => {
        expect(getStepSummary("event", mockFormData)).toBe("Birthday Party, Princess");
      });

      it("returns only event type when theme is not provided", () => {
        const formData = { ...mockFormData, theme: "" };
        expect(getStepSummary("event", formData)).toBe("Birthday Party");
      });

      it("returns only theme when event type is not provided", () => {
        const formData = { ...mockFormData, eventType: "" };
        expect(getStepSummary("event", formData)).toBe("Princess");
      });

      it("returns null when neither event type nor theme is provided", () => {
        const formData = { ...mockFormData, eventType: "", theme: "" };
        expect(getStepSummary("event", formData)).toBeNull();
      });
    });

    describe("designs step", () => {
      it('returns comma-separated names when designs are selected', () => {
        const formData = {
          ...mockFormData,
          selectedAdditionalDesigns: [
            { id: 'design-1', name: 'Sprinkles' },
            { id: 'design-2', name: 'Gold or silver painted' },
          ],
        };
        expect(getStepSummary('designs', formData)).toBe(
          'Sprinkles, Gold or silver painted'
        );
      });

      it('returns null when no designs are selected', () => {
        const formData = { ...mockFormData, selectedAdditionalDesigns: [] };
        expect(getStepSummary('designs', formData)).toBeNull();
      });

      it('returns single design name correctly', () => {
        const formData = {
          ...mockFormData,
          selectedAdditionalDesigns: [{ id: 'design-3', name: 'Edible images or logos' }],
        };
        expect(getStepSummary('designs', formData)).toBe(
          'Edible images or logos'
        );
      });
    });

    describe("pickup step", () => {
      it("returns formatted pickup date and time when both are provided", () => {
        expect(getStepSummary("pickup", mockFormData)).toBe("Jan 15, 2024 at 5:00 PM");
      });

      it("returns null when pickup date is not provided", () => {
        const formData = { ...mockFormData, pickupDate: "" };
        expect(getStepSummary("pickup", formData)).toBeNull();
      });

      it("returns null when pickup time is not provided", () => {
        const formData = { ...mockFormData, pickupTime: "" };
        expect(getStepSummary("pickup", formData)).toBeNull();
      });

      it("returns null when neither pickup date nor time is provided", () => {
        const formData = { ...mockFormData, pickupDate: "", pickupTime: "" };
        expect(getStepSummary("pickup", formData)).toBeNull();
      });
    });

    it("returns null for unknown step", () => {
      expect(getStepSummary("unknown", mockFormData)).toBeNull();
    });
  });
});
