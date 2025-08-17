import type { FormData } from "../types/formTypes";

export interface FormStep {
  id: string;
  title: string;
}

/**
 * Checks if a specific step has data based on the form data
 */
export const hasStepData = (stepId: string, formData: FormData): boolean => {
  switch (stepId) {
    case "lead":
      return !!(
        formData.firstName ||
        formData.lastName ||
        formData.email ||
        formData.phone
      );
    case "communication":
      return !!formData.communicationMethod;
    case "package":
      return !!formData.packageType;
    case "by-dozen":
      return (
        formData.packageType === "by-dozen" &&
        (formData.riceKrispies > 0 ||
          formData.oreos > 0 ||
          formData.pretzels > 0 ||
          formData.marshmallows > 0)
      );
    case "color":
      return !!formData.colorScheme;
    case "event":
      return !!(formData.eventType || formData.theme);
    case "designs":
      return !!formData.additionalDesigns;
    case "pickup":
      return !!(formData.pickupDate && formData.pickupTime);
    default:
      return false;
  }
};

/**
 * Checks if a step is completed (has data or has been visited)
 */
export const isStepCompleted = (stepId: string, formData: FormData): boolean => {
  // If the step has data, it's completed
  if (hasStepData(stepId, formData)) {
    return true;
  }

  // If the step has been visited, it's completed (user made a choice, even if to skip)
  if (formData.visitedSteps.has(stepId)) {
    return true;
  }

  return false;
};

/**
 * Gets the status of a step (completed, current, or pending)
 */
export const getStepStatus = (
  stepIndex: number,
  formSteps: FormStep[],
  currentVisibleIndex: number
): "completed" | "current" | "pending" => {
  const visibleIndex = getVisibleStepIndex(stepIndex, formSteps);
  if (visibleIndex < currentVisibleIndex) return "completed";
  if (visibleIndex === currentVisibleIndex) return "current";
  return "pending";
};

/**
 * Checks if a step is accessible for navigation
 */
export const isStepAccessible = (
  stepIndex: number,
  formSteps: FormStep[],
  currentVisibleIndex: number,
  formData: FormData
): boolean => {
  const visibleIndex = getVisibleStepIndex(stepIndex, formSteps);
  const currentVisible = currentVisibleIndex ?? 0;

  // Always allow access to current step
  if (visibleIndex === currentVisible) return true;

  // Always allow access to completed steps
  if (visibleIndex < currentVisible) return true;

  // For future steps, check if there's a continuous path of completed steps
  // from current step to the target step
  for (let i = currentVisible; i <= visibleIndex; i++) {
    const stepId = formSteps[i]?.id;
    if (stepId && !isStepCompleted(stepId, formData)) {
      // If any step in the path is not completed, the target is not accessible
      return false;
    }
  }

  return true;
};

/**
 * Counts the number of completed steps
 */
export const getCompletedStepsCount = (
  formSteps: FormStep[],
  formData: FormData
): number => {
  return formSteps.reduce((count, step) => {
    return isStepCompleted(step.id, formData) ? count + 1 : count;
  }, 0);
};

/**
 * Converts visible step index to full step index
 */
export const getFullStepIndex = (
  visibleIndex: number,
  formSteps: FormStep[]
): number => {
  const stepId = formSteps[visibleIndex]?.id;
  if (!stepId) return visibleIndex;

  // Map step IDs to their full array indices
  const stepIdToFullIndex: Record<string, number> = {
    lead: 0,
    communication: 1,
    package: 2,
    "by-dozen": 3,
    color: 4,
    event: 5,
    designs: 6,
    pickup: 7,
  };

  return stepIdToFullIndex[stepId] ?? visibleIndex;
};

/**
 * Converts full step index to visible step index
 */
export const getVisibleStepIndex = (
  fullIndex: number,
  formSteps: FormStep[]
): number => {
  const stepId = formSteps.find((_, index) => index === fullIndex)?.id;
  if (!stepId) return fullIndex;

  return formSteps.findIndex((s) => s.id === stepId);
};
