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

export const ColorScheme = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: FormStepProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateFormData({ colorScheme: e.target.value });
  };

  const isValid = formData.colorScheme.trim().length > 0;

  const handleContinue = () => {
    if (isValid) onNext();
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.questionSection}>
        <h3 className={styles.questionTitle}>Desired color scheme?</h3>
        <p className={styles.questionDescription}>
          Tell us the colors you’d like to see in your treats. We’ll do our best
          to match your palette.
        </p>
      </div>

      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="colorScheme" className={styles.label}>
            Color Scheme *
          </label>
          <input
            id="colorScheme"
            type="text"
            value={formData.colorScheme}
            onChange={handleChange}
            className={styles.input}
            placeholder="e.g., Blush pink, ivory, and gold"
            required
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
          disabled={!isValid}
          className={`${styles.button} ${styles.primaryButton} ${
            !isValid ? styles.disabled : ""
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
