import type { FormData } from '@/types/formTypes';
import { formatDateForDisplay } from "@/utils/timeUtils";

/**
 * Generates a summary for a specific form step based on the form data
 */
export const getStepSummary = (stepId: string, formData: FormData): string | null => {
  switch (stepId) {
    case "lead":
      if (
        formData.firstName ||
        formData.lastName ||
        formData.email ||
        formData.phone
      ) {
        return (
          `${formData.firstName} ${formData.lastName}`.trim() ||
          formData.email ||
          "Contact info provided"
        );
      }
      return null;

    case "communication":
      if (formData.communicationMethod) {
        return formData.communicationMethod === "email" ? "Email" : "Text";
      }
      return null;

    case "package":
      if (formData.packageType) {
        const packageNames = {
          small: "Small Package (3 dozen)",
          medium: "Medium Package (5 dozen)",
          large: "Large Package (8 dozen)",
          xl: "XL Package (12 dozen)",
          "by-dozen": "By The Dozen",
        };
        return packageNames[formData.packageType] || null;
      }
      return null;

    case "by-dozen":
      if (formData.packageType === "by-dozen") {
        const items = [];
        if (formData.riceKrispies > 0)
          items.push(`${formData.riceKrispies} Rice Krispies`);
        if (formData.oreos > 0) items.push(`${formData.oreos} Oreos`);
        if (formData.pretzels > 0)
          items.push(`${formData.pretzels} Pretzels`);
        if (formData.marshmallows > 0)
          items.push(`${formData.marshmallows} Marshmallows`);
        return items.length > 0 ? items.join(", ") : null;
      }
      return null;

    case "color":
      return formData.colorScheme || null;

    case "event": {
      const eventDetails: string[] = [];
      if (formData.eventType) eventDetails.push(formData.eventType);
      if (formData.theme) eventDetails.push(formData.theme);
      return eventDetails.length > 0 ? eventDetails.join(", ") : null;
    }

    case "designs":
      return formData.additionalDesigns || null;

    case "pickup":
      if (formData.pickupDate && formData.pickupTime) {
        return `${formatDateForDisplay(formData.pickupDate, {
          includeYear: true,
        })} at ${formData.pickupTime}`;
      }
      return null;

    default:
      return null;
  }
};
