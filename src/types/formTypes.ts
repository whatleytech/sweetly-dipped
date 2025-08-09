export interface FormData {
  // Lead Questions
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Communication Preference
  communicationMethod: "email" | "text" | "";

  // Package Selection
  packageType: "small" | "medium" | "large" | "xl" | "by-dozen" | "";

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
  pickupTime: string;
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
  price?: string;
}

export interface TreatOption {
  key: keyof Pick<FormData, "riceKrispies" | "oreos" | "pretzels" | "marshmallows">;
  label: string;
  price: number;
}

export interface TimeSlots {
  [key: string]: string[];
}
