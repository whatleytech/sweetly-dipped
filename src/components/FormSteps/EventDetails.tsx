import type { ChangeEvent } from "react";
import styles from "./FormSteps.module.css";
import type { FormStepProps, FormData } from "../../types/formTypes";
import { FormButtons, FormStepContainer } from "../shared";

export const EventDetails = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps) => {
  const handleChange =
    (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
      updateFormData({ [field]: e.target.value } as Partial<FormData>);
    };

  return (
    <FormStepContainer
      title="Event details (optional)"
      description="If these treats are for an event, tell us the type and any theme you have in mind."
    >
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

      <FormButtons
        onPrev={onPrev}
        onNext={onNext}
        onSubmit={onSubmit}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isValid={true} // This step is always valid (optional fields)
      />
    </FormStepContainer>
  );
};
