import styles from "./FormSteps.module.css";
import type { FormData } from "../../pages/DesignPackagePage";

interface FormStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const LeadQuestions = ({
  formData,
  updateFormData,
  onNext,
}: FormStepProps) => {
  const isValidEmail = (email: string): boolean => {
    // Basic RFC 5322-inspired email pattern good enough for client-side checks
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    // Enforce 123-456-7890 format
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    return phonePattern.test(phone);
  };

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "phone") {
        const rawValue = e.target.value;
        const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 10);

        const formatPhone = (digits: string): string => {
          if (digits.length <= 3) return digits;
          if (digits.length <= 6)
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
          return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
            6
          )}`;
        };

        updateFormData({ phone: formatPhone(digitsOnly) });
        return;
      }

      updateFormData({ [field]: e.target.value });
    };

  const isFormValid = () => {
    const hasAllRequiredValues =
      !!formData.firstName.trim() &&
      !!formData.lastName.trim() &&
      !!formData.email.trim() &&
      !!formData.phone.trim();

    if (!hasAllRequiredValues) return false;

    return (
      isValidEmail(formData.email.trim()) && isValidPhone(formData.phone.trim())
    );
  };

  const handleNext = () => {
    if (isFormValid()) {
      onNext();
    }
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.questionSection}>
        <h3 className={styles.questionTitle}>
          Let's start with your contact information
        </h3>
        <p className={styles.questionDescription}>
          We'll use this information to confirm your order and keep you updated
          on your treats!
        </p>
      </div>

      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="firstName" className={styles.label}>
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange("firstName")}
            className={styles.input}
            placeholder="Enter your first name"
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="lastName" className={styles.label}>
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange("lastName")}
            className={styles.input}
            placeholder="Enter your last name"
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className={styles.input}
            placeholder="Enter your email address"
            aria-invalid={!!formData.email && !isValidEmail(formData.email)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="phone" className={styles.label}>
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            pattern="\\d{3}-\\d{3}-\\d{4}"
            maxLength={12}
            value={formData.phone}
            onChange={handleInputChange("phone")}
            className={styles.input}
            placeholder="123-456-7890"
            aria-invalid={!!formData.phone && !isValidPhone(formData.phone)}
            required
          />
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isFormValid()}
          className={`${styles.button} ${styles.primaryButton} ${
            !isFormValid() ? styles.disabled : ""
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
