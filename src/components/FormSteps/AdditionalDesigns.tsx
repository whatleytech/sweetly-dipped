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

export const AdditionalDesigns = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: FormStepProps) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ additionalDesigns: e.target.value });
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.questionSection}>
        <h3 className={styles.questionTitle}>Additional designs</h3>
        <p className={styles.questionDescription}>
          Base pricing includes your colors, drizzle, themed chocolate molds,
          and sprinkles. For custom designs, describe your ideas. You can share
          inspiration photos in our email follow-up.
        </p>
      </div>

      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="additionalDesigns" className={styles.label}>
            Design notes (optional)
          </label>
          <textarea
            id="additionalDesigns"
            value={formData.additionalDesigns}
            onChange={handleChange}
            className={styles.input}
            placeholder="Describe any custom elements or inspiration here..."
            rows={5}
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
