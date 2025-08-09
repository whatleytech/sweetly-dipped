import type { ChangeEvent } from "react";
import styles from "./FormSteps.module.css";
import type { FormStepProps } from "../../types/formTypes";
import { FormButtons, FormStepContainer } from "../shared";

export const AdditionalDesigns = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ additionalDesigns: e.target.value });
  };

  return (
    <FormStepContainer
      title="Additional designs"
      description="Base pricing includes your colors, drizzle, themed chocolate molds, and sprinkles. For custom designs, describe your ideas. You can share inspiration photos in our email follow-up."
    >
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

      <FormButtons
        onPrev={onPrev}
        onNext={onNext}
        onSubmit={onSubmit}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isValid={true} // This step is always valid (optional field)
      />
    </FormStepContainer>
  );
};
