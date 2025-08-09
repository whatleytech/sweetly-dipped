import styles from "./FormSteps.module.css";
import type { FormStepProps } from "../../types/formTypes";
import { FormButtons, FormStepContainer } from "../shared";

export const CommunicationPreference = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps) => {
  const handleRadioChange = (value: "email" | "text") => {
    updateFormData({ communicationMethod: value });
  };

  const isFormValid = () => {
    return formData.communicationMethod !== "";
  };

  return (
    <FormStepContainer
      title="How would you like us to contact you?"
      description="We'll use this method to confirm your order and keep you updated on your treats!"
    >
      <div className={styles.formFields}>
        <div className={styles.radioGroup}>
          <div
            className={`${styles.radioOption} ${
              formData.communicationMethod === "email" ? styles.selected : ""
            }`}
            onClick={() => handleRadioChange("email")}
          >
            <input
              type="radio"
              name="communicationMethod"
              value="email"
              checked={formData.communicationMethod === "email"}
              onChange={() => handleRadioChange("email")}
              className={styles.radioInput}
            />
            <div>
              <label className={styles.radioLabel}>Email</label>
              <div className={styles.radioDescription}>
                We'll send order confirmations and updates to your email address
              </div>
            </div>
          </div>

          <div
            className={`${styles.radioOption} ${
              formData.communicationMethod === "text" ? styles.selected : ""
            }`}
            onClick={() => handleRadioChange("text")}
          >
            <input
              type="radio"
              name="communicationMethod"
              value="text"
              checked={formData.communicationMethod === "text"}
              onChange={() => handleRadioChange("text")}
              className={styles.radioInput}
            />
            <div>
              <label className={styles.radioLabel}>Text Message</label>
              <div className={styles.radioDescription}>
                We'll send order confirmations and updates via text message
              </div>
            </div>
          </div>
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
