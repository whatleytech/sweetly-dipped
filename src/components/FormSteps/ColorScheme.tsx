import type { ChangeEvent } from "react";
import styles from "./FormSteps.module.css";
import type { FormStepProps } from "@/types/formTypes";
import { FormButtons, FormStepContainer } from "@/components/shared";

export const ColorScheme = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateFormData({ colorScheme: e.target.value });
  };

  const isValid = formData.colorScheme.trim().length > 0;

  return (
    <FormStepContainer
      title="Desired color scheme?"
      description="Tell us the colors you'd like to see in your treats. We'll do our best to match your palette."
    >
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

      <FormButtons
        onPrev={onPrev}
        onNext={onNext}
        onSubmit={onSubmit}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isValid={isValid}
      />
    </FormStepContainer>
  );
};
