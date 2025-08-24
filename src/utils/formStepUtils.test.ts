import { describe, it, expect } from "vitest";
import {
  hasStepData,
  isStepCompleted,
  getStepStatus,
  isStepAccessible,
  getCompletedStepsCount,
  getFullStepIndex,
  getVisibleStepIndex,
  type FormStep,
} from "./formStepUtils";
import type { FormData } from "@/types/formTypes";

const mockFormSteps: FormStep[] = [
  { id: "lead", title: "Contact Information" },
  { id: "communication", title: "Communication Preference" },
  { id: "package", title: "Package Selection" },
  { id: "by-dozen", title: "By The Dozen" },
  { id: "color", title: "Color Scheme" },
  { id: "event", title: "Event Details" },
  { id: "designs", title: "Additional Designs" },
  { id: "pickup", title: "Pickup Details" },
];

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
  additionalDesigns: "Custom sprinkles",
  pickupDate: "2024-01-15",
  pickupTime: "5:00 PM",
  rushOrder: false,
  referralSource: "",
  termsAccepted: false,
  visitedSteps: new Set([
    "lead",
    "communication",
    "package",
    "by-dozen",
    "color",
    "event",
    "designs",
    "pickup",
  ]),
};

describe("formStepUtils", () => {
  describe("hasStepData", () => {
    it("returns true for lead step with data", () => {
      expect(hasStepData("lead", mockFormData)).toBe(true);
    });

    it("returns false for lead step without data", () => {
      const emptyFormData = { ...mockFormData, firstName: "", lastName: "", email: "", phone: "" };
      expect(hasStepData("lead", emptyFormData)).toBe(false);
    });

    it("returns true for communication step with data", () => {
      expect(hasStepData("communication", mockFormData)).toBe(true);
    });

    it("returns true for package step with data", () => {
      expect(hasStepData("package", mockFormData)).toBe(true);
    });

    it("returns true for by-dozen step with data when package type is by-dozen", () => {
      const byDozenData = { ...mockFormData, packageType: "by-dozen" as const };
      expect(hasStepData("by-dozen", byDozenData)).toBe(true);
    });

    it("returns false for by-dozen step when package type is not by-dozen", () => {
      expect(hasStepData("by-dozen", mockFormData)).toBe(false);
    });

    it("returns true for color step with data", () => {
      expect(hasStepData("color", mockFormData)).toBe(true);
    });

    it("returns true for event step with data", () => {
      expect(hasStepData("event", mockFormData)).toBe(true);
    });

    it("returns true for designs step with data", () => {
      expect(hasStepData("designs", mockFormData)).toBe(true);
    });

    it("returns true for pickup step with data", () => {
      expect(hasStepData("pickup", mockFormData)).toBe(true);
    });

    it("returns false for unknown step", () => {
      expect(hasStepData("unknown", mockFormData)).toBe(false);
    });
  });

  describe("isStepCompleted", () => {
    it("returns true when step has data", () => {
      expect(isStepCompleted("lead", mockFormData)).toBe(true);
    });

    it("returns true when step is visited even without data", () => {
      const formDataWithVisitedStep = {
        ...mockFormData,
        additionalDesigns: "", // No data
        visitedSteps: new Set(["designs"]), // But visited
      };
      expect(isStepCompleted("designs", formDataWithVisitedStep)).toBe(true);
    });

    it("returns false when step has no data and is not visited", () => {
      const formDataWithoutStep = {
        ...mockFormData,
        additionalDesigns: "", // No data
        visitedSteps: new Set(["lead", "communication"]), // Not visited
      };
      expect(isStepCompleted("designs", formDataWithoutStep)).toBe(false);
    });
  });

  describe("getStepStatus", () => {
    it("returns completed for steps before current", () => {
      expect(getStepStatus(0, mockFormSteps, 2)).toBe("completed");
      expect(getStepStatus(1, mockFormSteps, 2)).toBe("completed");
    });

    it("returns current for current step", () => {
      expect(getStepStatus(2, mockFormSteps, 2)).toBe("current");
    });

    it("returns pending for steps after current", () => {
      expect(getStepStatus(3, mockFormSteps, 2)).toBe("pending");
      expect(getStepStatus(4, mockFormSteps, 2)).toBe("pending");
    });
  });

  describe("isStepAccessible", () => {
    it("allows access to current step", () => {
      expect(isStepAccessible(2, mockFormSteps, 2, mockFormData)).toBe(true);
    });

    it("allows access to completed steps", () => {
      expect(isStepAccessible(0, mockFormSteps, 2, mockFormData)).toBe(true);
      expect(isStepAccessible(1, mockFormSteps, 2, mockFormData)).toBe(true);
    });

    it("allows access to future steps with continuous completed path", () => {
      expect(isStepAccessible(3, mockFormSteps, 2, mockFormData)).toBe(true);
      expect(isStepAccessible(4, mockFormSteps, 2, mockFormData)).toBe(true);
    });

    it("denies access to future steps without continuous completed path", () => {
      const incompleteFormData: FormData = {
        ...mockFormData,
        packageType: "", // Step 2 incomplete
        visitedSteps: new Set(["lead", "communication"]), // Only first 2 steps visited
      };
      expect(isStepAccessible(4, mockFormSteps, 2, incompleteFormData)).toBe(false);
    });
  });

  describe("getCompletedStepsCount", () => {
    it("counts all completed steps", () => {
      expect(getCompletedStepsCount(mockFormSteps, mockFormData)).toBe(8);
    });

    it("counts only steps with data or visited", () => {
      const partialFormData = {
        ...mockFormData,
        colorScheme: "", // No data
        eventType: "", // No data
        theme: "", // No data
        visitedSteps: new Set(["lead", "communication", "package", "by-dozen"]), // Only first 4 visited
      };
      expect(getCompletedStepsCount(mockFormSteps, partialFormData)).toBe(6);
    });
  });

  describe("getFullStepIndex", () => {
    it("maps visible index to full index correctly", () => {
      expect(getFullStepIndex(0, mockFormSteps)).toBe(0); // lead
      expect(getFullStepIndex(1, mockFormSteps)).toBe(1); // communication
      expect(getFullStepIndex(2, mockFormSteps)).toBe(2); // package
      expect(getFullStepIndex(3, mockFormSteps)).toBe(3); // by-dozen
      expect(getFullStepIndex(4, mockFormSteps)).toBe(4); // color
    });

    it("returns visible index when step not found in mapping", () => {
      const customSteps = [{ id: "custom", title: "Custom Step" }];
      expect(getFullStepIndex(0, customSteps)).toBe(0);
    });
  });

  describe("getVisibleStepIndex", () => {
    it("maps full index to visible index correctly", () => {
      expect(getVisibleStepIndex(0, mockFormSteps)).toBe(0); // lead
      expect(getVisibleStepIndex(1, mockFormSteps)).toBe(1); // communication
      expect(getVisibleStepIndex(2, mockFormSteps)).toBe(2); // package
      expect(getVisibleStepIndex(3, mockFormSteps)).toBe(3); // by-dozen
      expect(getVisibleStepIndex(4, mockFormSteps)).toBe(4); // color
    });

    it("returns full index when step not found", () => {
      expect(getVisibleStepIndex(999, mockFormSteps)).toBe(999);
    });
  });
});
