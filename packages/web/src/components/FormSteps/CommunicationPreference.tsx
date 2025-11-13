import styles from "./FormSteps.module.css";
import type { FormStepProps, FormData } from "@/types/formTypes";
import { FormButtons, FormStepContainer } from "@/components/shared";

interface CommunicationPreferenceRadioOptionProps {
  id: string;
  value: 'email' | 'text';
  label: string;
  description: string;
  selected: boolean;
  onChange: (value: 'email' | 'text') => void;
}

const CommunicationPreferenceRadioOption = ({
  id,
  value,
  label,
  description,
  selected,
  onChange,
}: CommunicationPreferenceRadioOptionProps) => (
  <div
    className={`${styles.radioOption} ${selected ? styles.selected : ''}`}
    onClick={() => onChange(value)}
  >
    <input
      id={id}
      type="radio"
      name="communicationMethod"
      value={value}
      checked={selected}
      onChange={() => onChange(value)}
      className={styles.radioInput}
    />
    <div>
      <label htmlFor={id} className={styles.radioLabel}>
        {label}
      </label>
      <div className={styles.radioDescription}>{description}</div>
    </div>
  </div>
);

export const CommunicationPreference = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps & { updateFormData: (updates: Partial<FormData>) => void }) => {
  const handleRadioChange = (value: 'email' | 'text') => {
    updateFormData({ communicationMethod: value });
  };

  const isFormValid = () => {
    return formData.communicationMethod !== '';
  };

  return (
    <FormStepContainer
      title="How would you like us to contact you?"
      description="We'll use this method to confirm your order and keep you updated on your treats!"
    >
      <div className={styles.formFields}>
        <div className={styles.radioGroup}>
          <CommunicationPreferenceRadioOption
            id="email"
            value="email"
            label="Email"
            description="We'll send order confirmations and updates to your email address"
            selected={formData.communicationMethod === 'email'}
            onChange={handleRadioChange}
          />

          <CommunicationPreferenceRadioOption
            id="text"
            value="text"
            label="Text Message"
            description="We'll send order confirmations and updates via text message"
            selected={formData.communicationMethod === 'text'}
            onChange={handleRadioChange}
          />
        </div>
      </div>

      <FormButtons
        onPrev={onPrev}
        onNext={onNext}
        onSubmit={onSubmit}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isValid={isFormValid()}
      />
    </FormStepContainer>
  );
};
