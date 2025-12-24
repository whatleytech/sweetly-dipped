import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FormSidebar } from "./FormSidebar";
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
  additionalDesigns: "Custom sprinkles",
  selectedAdditionalDesigns: [],
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

const mockFormSteps = [
  { id: "lead", title: "Contact Information", component: () => null },
  {
    id: "communication",
    title: "Communication Preference",
    component: () => null,
  },
  { id: "package", title: "Package Selection", component: () => null },
  { id: "by-dozen", title: "By The Dozen", component: () => null },
  { id: "color", title: "Color Scheme", component: () => null },
  { id: "event", title: "Event Details", component: () => null },
  { id: "designs", title: "Additional Designs", component: () => null },
  { id: "pickup", title: "Pickup Details", component: () => null },
];

describe("FormSidebar", () => {
  const mockOnNavigateToStep = vi.fn();

  beforeEach(() => {
    mockOnNavigateToStep.mockClear();
  });

  it("renders the sidebar title", () => {
    render(
      <FormSidebar
        formData={mockFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={2}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    expect(screen.getByText("Your Progress")).toBeInTheDocument();
  });

  it("renders all form steps with correct status", () => {
    render(
      <FormSidebar
        formData={mockFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={2}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    expect(screen.getByText("Contact Information")).toBeInTheDocument();
    expect(screen.getByText("Communication Preference")).toBeInTheDocument();
    expect(screen.getByText("Package Selection")).toBeInTheDocument();
    expect(screen.getByText("By The Dozen")).toBeInTheDocument();
    expect(screen.getByText("Color Scheme")).toBeInTheDocument();
    expect(screen.getByText("Event Details")).toBeInTheDocument();
    expect(screen.getByText("Additional Designs")).toBeInTheDocument();
    expect(screen.getByText("Pickup Details")).toBeInTheDocument();
  });

  it("shows step summaries for completed steps", () => {
    render(
      <FormSidebar
        formData={mockFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={2}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    // Contact info summary
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    // Communication preference summary
    expect(screen.getByText("Email")).toBeInTheDocument();

    // Package selection summary
    expect(screen.getByText("Medium Package (5 dozen)")).toBeInTheDocument();
  });

  it("shows by-the-dozen summary when package type is by-dozen", () => {
    const byDozenFormData = {
      ...mockFormData,
      packageType: "by-dozen" as const,
    };

    render(
      <FormSidebar
        formData={byDozenFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={4}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    expect(screen.getByText("2 Rice Krispies, 1 Oreos")).toBeInTheDocument();
  });

  it("shows color scheme summary", () => {
    render(
      <FormSidebar
        formData={mockFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={5}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    expect(screen.getByText("Pink and Gold")).toBeInTheDocument();
  });

  it("shows event details summary", () => {
    render(
      <FormSidebar
        formData={mockFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={6}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    expect(screen.getByText("Birthday Party, Princess")).toBeInTheDocument();
  });

  it("shows pickup details summary", () => {
    render(
      <FormSidebar
        formData={mockFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={7}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    expect(screen.getByText("Jan 15, 2024 at 5:00 PM")).toBeInTheDocument();
  });

  it("displays correct progress information based on completed data", () => {
    render(
      <FormSidebar
        formData={mockFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={2}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    // With mockFormData, all 8 steps have data and are visited, so it should show "8 of 8 steps completed"
    expect(screen.getByText("8 of 8 steps completed")).toBeInTheDocument();
  });

  it("handles empty form data gracefully", () => {
    const emptyFormData: FormData = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      communicationMethod: "",
      packageType: "",
      riceKrispies: 0,
      oreos: 0,
      pretzels: 0,
      marshmallows: 0,
      colorScheme: "",
      eventType: "",
      theme: "",
      additionalDesigns: "",
      selectedAdditionalDesigns: [],
      pickupDate: "",
      pickupTime: "",
      rushOrder: false,
      referralSource: "",
      termsAccepted: false,
      visitedSteps: new Set(["lead"]), // Only first step visited
    };

    render(
      <FormSidebar
        formData={emptyFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={0}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    expect(screen.getByText("Your Progress")).toBeInTheDocument();
    expect(screen.getByText("1 of 8 steps completed")).toBeInTheDocument();
  });

  it("displays correct progress when by-dozen step is skipped", () => {
    // Create form data where by-dozen step is skipped (package type is not "by-dozen")
    const formDataWithoutByDozen = {
      ...mockFormData,
      packageType: "medium" as const, // Not "by-dozen", so by-dozen step is skipped
    };

    // Create visible steps that exclude the by-dozen step
    const visibleStepsWithoutByDozen = mockFormSteps.filter(
      (step) => step.id !== "by-dozen"
    );

    render(
      <FormSidebar
        formData={formDataWithoutByDozen}
        formSteps={visibleStepsWithoutByDozen}
        currentVisibleIndex={3}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    // Should show "7 of 7 steps completed" (all steps except by-dozen have data and are visited)
    expect(screen.getByText("7 of 7 steps completed")).toBeInTheDocument();

    // Verify that by-dozen step is not rendered
    expect(screen.queryByText("By The Dozen")).not.toBeInTheDocument();
  });

  it("displays partial progress when some steps have data", () => {
    const partialFormData: FormData = {
      ...mockFormData,
      colorScheme: "", // No color scheme
      eventType: "", // No event type
      theme: "", // No theme
      additionalDesigns: "", // No additional designs
      pickupDate: "", // No pickup time
      pickupTime: "", // No pickup time
      visitedSteps: new Set(["lead", "communication", "package", "by-dozen"]), // Only first 4 steps visited
    };

    render(
      <FormSidebar
        formData={partialFormData}
        formSteps={mockFormSteps}
        currentVisibleIndex={2}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    // Should show "4 of 8 steps completed" (lead, communication, package, by-dozen have data and are visited)
    expect(screen.getByText("4 of 8 steps completed")).toBeInTheDocument();
  });

  it("counts visited steps as completed even without data", () => {
    const formDataWithVisitedSteps = {
      ...mockFormData,
      additionalDesigns: "", // No additional designs
      visitedSteps: new Set([
        "lead",
        "communication",
        "package",
        "by-dozen",
        "color",
        "event",
        "designs", // Visited but no data
        "pickup",
      ]),
    };

    render(
      <FormSidebar
        formData={formDataWithVisitedSteps}
        formSteps={mockFormSteps}
        currentVisibleIndex={7}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    // Should show "8 of 8 steps completed" because all steps are visited
    expect(screen.getByText("8 of 8 steps completed")).toBeInTheDocument();
  });

  it("applies hasData class to visited steps even without data", () => {
    const formDataWithVisitedSteps = {
      ...mockFormData,
      additionalDesigns: "", // No additional designs
      visitedSteps: new Set([
        "lead",
        "communication",
        "package",
        "by-dozen",
        "color",
        "event",
        "designs", // Visited but no data
        "pickup",
      ]),
    };

    render(
      <FormSidebar
        formData={formDataWithVisitedSteps}
        formSteps={mockFormSteps}
        currentVisibleIndex={7}
        onNavigateToStep={mockOnNavigateToStep}
      />
    );

    // The designs step should have the hasData class even though it has no data (because it's visited)
    const designsStep = screen
      .getByText("Additional Designs")
      .closest('[class*="stepItem"]');
    expect(designsStep?.className).toContain("hasData");
  });

  describe("clickable steps functionality", () => {
    it("calls onNavigateToStep when clicking on a completed step", () => {
      render(
        <FormSidebar
          formData={mockFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={3}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Click on the first step (completed)
      const firstStep = screen
        .getByText("Contact Information")
        .closest('[class*="stepItem"]');
      fireEvent.click(firstStep!);

      expect(mockOnNavigateToStep).toHaveBeenCalledWith(0);
    });

    it("calls onNavigateToStep when clicking on the current step", () => {
      render(
        <FormSidebar
          formData={mockFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={2}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Click on the current step (Package Selection)
      const currentStep = screen
        .getByText("Package Selection")
        .closest('[class*="stepItem"]');
      fireEvent.click(currentStep!);

      expect(mockOnNavigateToStep).toHaveBeenCalledWith(2);
    });

    it("calls onNavigateToStep when clicking on the immediate next step", () => {
      render(
        <FormSidebar
          formData={mockFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={2}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Click on the next step (By The Dozen) - should be accessible as immediate next step
      const nextStep = screen
        .getByText("By The Dozen")
        .closest('[class*="stepItem"]');
      fireEvent.click(nextStep!);

      expect(mockOnNavigateToStep).toHaveBeenCalledWith(3);
    });

    it("calls onNavigateToStep when clicking on a future step that has data", () => {
      render(
        <FormSidebar
          formData={mockFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={1}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Click on Color Scheme (step 4) which has data - should be accessible
      const futureStep = screen
        .getByText("Color Scheme")
        .closest('[class*="stepItem"]');
      fireEvent.click(futureStep!);

      expect(mockOnNavigateToStep).toHaveBeenCalledWith(4);
    });

    it("calls onNavigateToStep when clicking on a future step if any intermediate step has data", () => {
      render(
        <FormSidebar
          formData={mockFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={1}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Click on Event Details (step 5) - should be accessible because Color Scheme (step 4) has data
      const futureStep = screen
        .getByText("Event Details")
        .closest('[class*="stepItem"]');
      fireEvent.click(futureStep!);

      expect(mockOnNavigateToStep).toHaveBeenCalledWith(5);
    });

    it("does not call onNavigateToStep when clicking on a future step with no data path", () => {
      const emptyFormData: FormData = {
        ...mockFormData,
        packageType: "", // No package selected
        colorScheme: "", // No color scheme
        eventType: "", // No event type
        theme: "", // No theme
        visitedSteps: new Set(["lead", "communication"]), // Only first 2 steps visited
      };

      render(
        <FormSidebar
          formData={emptyFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={2}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Click on a future step (Color Scheme) - should not be accessible because no intermediate steps have data
      const futureStep = screen
        .getByText("Color Scheme")
        .closest('[class*="stepItem"]');
      fireEvent.click(futureStep!);

      expect(mockOnNavigateToStep).not.toHaveBeenCalled();
    });

    it("does not allow jumping to future steps when current step is not completed", () => {
      const formDataWithIncompleteCurrentStep: FormData = {
        ...mockFormData,
        packageType: "", // Current step (Package Selection) is not completed
        visitedSteps: new Set(["lead", "communication"]), // Only first 2 steps visited
      };

      render(
        <FormSidebar
          formData={formDataWithIncompleteCurrentStep}
          formSteps={mockFormSteps}
          currentVisibleIndex={2}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Click on a future step (Color Scheme) - should not be accessible because current step is not completed
      const futureStep = screen
        .getByText("Color Scheme")
        .closest('[class*="stepItem"]');
      fireEvent.click(futureStep!);

      expect(mockOnNavigateToStep).not.toHaveBeenCalled();
    });

    it("allows jumping back to any completed step from a later step", () => {
      render(
        <FormSidebar
          formData={mockFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={4}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Should be able to jump back to step 1 (Contact Information)
      const step1 = screen
        .getByText("Contact Information")
        .closest('[class*="stepItem"]');
      fireEvent.click(step1!);
      expect(mockOnNavigateToStep).toHaveBeenCalledWith(0);

      // Should be able to jump back to step 2 (Communication Preference)
      const step2 = screen
        .getByText("Communication Preference")
        .closest('[class*="stepItem"]');
      fireEvent.click(step2!);
      expect(mockOnNavigateToStep).toHaveBeenCalledWith(1);

      // Should be able to jump back to step 3 (Package Selection)
      const step3 = screen
        .getByText("Package Selection")
        .closest('[class*="stepItem"]');
      fireEvent.click(step3!);
      expect(mockOnNavigateToStep).toHaveBeenCalledWith(2);
    });

    it("handles conditional by-dozen step correctly when package type is not by-dozen", () => {
      const formDataWithoutByDozen = {
        ...mockFormData,
        packageType: "medium" as const, // Not "by-dozen"
      };

      const visibleStepsWithoutByDozen = mockFormSteps.filter(
        (step) => step.id !== "by-dozen"
      );

      render(
        <FormSidebar
          formData={formDataWithoutByDozen}
          formSteps={visibleStepsWithoutByDozen}
          currentVisibleIndex={3}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Click on Color Scheme (visible step 3, full step 4)
      const colorStep = screen
        .getByText("Color Scheme")
        .closest('[class*="stepItem"]');
      fireEvent.click(colorStep!);

      expect(mockOnNavigateToStep).toHaveBeenCalledWith(4); // Should call with full step index
    });

    it("handles conditional by-dozen step correctly when package type is by-dozen", () => {
      const formDataWithByDozen = {
        ...mockFormData,
        packageType: "by-dozen" as const,
      };

      render(
        <FormSidebar
          formData={formDataWithByDozen}
          formSteps={mockFormSteps}
          currentVisibleIndex={3}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Click on By The Dozen step (use getAllByText to get the step item, not the summary)
      const byDozenSteps = screen.getAllByText("By The Dozen");
      const byDozenStepItem = byDozenSteps.find((el) =>
        el.closest('[class*="stepItem"]')
      );
      fireEvent.click(byDozenStepItem!);

      expect(mockOnNavigateToStep).toHaveBeenCalledWith(2); // Should call with full step index
    });

    it("applies clickable class to accessible steps", () => {
      render(
        <FormSidebar
          formData={mockFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={2}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Check that completed steps have the clickable class
      const completedStep = screen
        .getByText("Contact Information")
        .closest('[class*="stepItem"]');
      expect(completedStep?.className).toContain("clickable");

      // Check that current step has the clickable class
      const currentStep = screen
        .getByText("Package Selection")
        .closest('[class*="stepItem"]');
      expect(currentStep?.className).toContain("clickable");

      // Check that next step has the clickable class
      const nextStep = screen
        .getByText("By The Dozen")
        .closest('[class*="stepItem"]');
      expect(nextStep?.className).toContain("clickable");

      // Check that future steps with data have the clickable class
      const futureStep = screen
        .getByText("Color Scheme")
        .closest('[class*="stepItem"]');
      expect(futureStep?.className).toContain("clickable");
    });

    it("does not apply clickable class to inaccessible steps", () => {
      const emptyFormData: FormData = {
        ...mockFormData,
        packageType: "",
        colorScheme: "",
        eventType: "",
        theme: "",
        visitedSteps: new Set(["lead", "communication"]), // Only first 2 steps visited
      };

      render(
        <FormSidebar
          formData={emptyFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={2}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Check that future steps without data path don't have the clickable class
      const futureStep = screen
        .getByText("Color Scheme")
        .closest('[class*="stepItem"]');
      expect(futureStep?.className).not.toContain("clickable");
    });

    it("applies hasData class to steps with data", () => {
      render(
        <FormSidebar
          formData={mockFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={2}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Check that steps with data have the hasData class
      const stepWithData = screen
        .getByText("Contact Information")
        .closest('[class*="stepItem"]');
      expect(stepWithData?.className).toContain("hasData");

      const colorStepWithData = screen
        .getByText("Color Scheme")
        .closest('[class*="stepItem"]');
      expect(colorStepWithData?.className).toContain("hasData");
    });

    it("does not apply hasData class to steps without data and not visited", () => {
      const emptyFormData: FormData = {
        ...mockFormData,
        colorScheme: "",
        eventType: "",
        theme: "",
        visitedSteps: new Set(["lead", "communication", "package", "by-dozen"]), // Only first 4 steps visited
      };

      render(
        <FormSidebar
          formData={emptyFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={2}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Check that steps without data and not visited don't have the hasData class
      const stepWithoutData = screen
        .getByText("Color Scheme")
        .closest('[class*="stepItem"]');
      expect(stepWithoutData?.className).not.toContain("hasData");
    });

    it("sets proper ARIA attributes for clickable steps", () => {
      render(
        <FormSidebar
          formData={mockFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={3}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Check that clickable steps have proper ARIA attributes
      const clickableStep = screen
        .getByText("Contact Information")
        .closest('[class*="stepItem"]');
      expect(clickableStep).toHaveAttribute("role", "button");
      expect(clickableStep).toHaveAttribute("tabIndex", "0");
    });

    it("does not set ARIA attributes for non-clickable steps", () => {
      const emptyFormData: FormData = {
        ...mockFormData,
        packageType: "",
        colorScheme: "",
        eventType: "",
        theme: "",
        visitedSteps: new Set(["lead", "communication"]), // Only first 2 steps visited
      };

      render(
        <FormSidebar
          formData={emptyFormData}
          formSteps={mockFormSteps}
          currentVisibleIndex={2}
          onNavigateToStep={mockOnNavigateToStep}
        />
      );

      // Check that non-clickable steps don't have ARIA attributes
      const nonClickableStep = screen
        .getByText("Color Scheme")
        .closest('[class*="stepItem"]');
      expect(nonClickableStep).not.toHaveAttribute("role");
      expect(nonClickableStep).not.toHaveAttribute("tabIndex");
    });
  });
});
