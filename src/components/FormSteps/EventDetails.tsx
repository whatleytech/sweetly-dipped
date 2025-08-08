import type { ChangeEvent } from "react";
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

export const EventDetails = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: FormStepProps) => {
  const handleChange =
    (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
      updateFormData({ [field]: e.target.value } as Partial<FormData>);
    };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.questionSection}>
        <h3 className={styles.questionTitle}>Event details (optional)</h3>
        <p className={styles.questionDescription}>
          If these treats are for an event, tell us the type and any theme you
          have in mind.
        </p>
      </div>

      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="eventType" className={styles.label}>
            Type of event
          </label>
          <input
            id="eventType"
            type="text"
            value={formData.eventType}
            onChange={handleChange("eventType")}
            className={styles.input}
            placeholder="e.g., Wedding, Birthday Party, Corporate"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="theme" className={styles.label}>
            Theme
          </label>
          <input
            id="theme"
            type="text"
            value={formData.theme}
            onChange={handleChange("theme")}
            className={styles.input}
            placeholder="e.g., Garden party, Princess, Minimalist gold"
          />
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={onPrev}
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
