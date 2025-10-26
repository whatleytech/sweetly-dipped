import type { ChangeEvent } from "react";
import styles from "./FormSteps.module.css";
import type { FormStepProps, FormData } from "@/types/formTypes";
import { FormButtons, FormStepContainer } from "@/components/shared";

interface EventDetailsInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const EventDetailsInput = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}: EventDetailsInputProps) => (
  <div className={styles.fieldGroup}>
    <label htmlFor={id} className={styles.label}>
      {label}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      className={styles.input}
      placeholder={placeholder}
    />
  </div>
);

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
        <EventDetailsInput
          id="event-type"
          label="Type of event"
          placeholder="e.g., Wedding, Birthday Party, Corporate"
          value={formData.eventType}
          onChange={handleChange('eventType')}
        />

        <EventDetailsInput
          id="theme"
          label="Theme"
          placeholder="e.g., Garden party, Princess, Minimalist gold"
          value={formData.theme}
          onChange={handleChange('theme')}
        />
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
