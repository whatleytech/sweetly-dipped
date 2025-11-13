export interface FormData {
  // Lead Questions
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Communication Preference
  communicationMethod: "email" | "text" | "";

  // Package Selection
  packageType: "small" | "medium" | "large" | "xl" | "by-dozen" | ""; // Empty string for unselected state

  // By The Dozen
  riceKrispies: number;
  oreos: number;
  pretzels: number;
  marshmallows: number;

  // Design Details
  colorScheme: string;
  eventType: string;
  theme: string;
  additionalDesigns: string;

  // Pickup Details
  pickupDate: string;
  pickupTime: string; // The specific time within the window (e.g., "8:15 AM")
  rushOrder: boolean; // True if pickup is within 2 weeks (rush order)

  // Confirmation Page
  referralSource: string;
  termsAccepted: boolean;

  // Track visited steps
  visitedSteps: Set<string>;
}

export interface FormStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface PackageOption {
  id: FormData["packageType"];
  label: string;
  description?: string;
  price?: number;
}

export interface TreatOption {
  key: keyof Pick<FormData, "riceKrispies" | "oreos" | "pretzels" | "marshmallows">;
  label: string;
  price: number;
}

export interface Time {
  hour: number;
  minute: number;
  timeOfDay: "morning" | "evening";
}

export interface TimeSlot {
  startTime: Time;
  endTime: Time;
}

export type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface UnavailablePeriod {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate?: string; // ISO date string (YYYY-MM-DD) - optional for single-day unavailability
  reason?: string; // Optional reason for unavailability
}

export type TimeSlots = {
  [key in DayOfWeek]: TimeSlot[];
};
