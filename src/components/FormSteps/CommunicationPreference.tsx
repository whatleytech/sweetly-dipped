import React from 'react';
import styles from './FormSteps.module.css';
import type { FormData } from '../../pages/DesignPackagePage';

interface FormStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const CommunicationPreference = ({ 
  formData, 
  updateFormData, 
  onNext, 
  onPrev 
}: FormStepProps) => {
  const handleRadioChange = (value: 'email' | 'text') => {
    updateFormData({ communicationMethod: value });
  };

  const isFormValid = () => {
    return formData.communicationMethod !== '';
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
          How would you like us to contact you?
        </h3>
        <p className={styles.questionDescription}>
          We'll use this method to confirm your order and keep you updated on your treats!
        </p>
      </div>

      <div className={styles.formFields}>
        <div className={styles.radioGroup}>
          <div 
            className={`${styles.radioOption} ${
              formData.communicationMethod === 'email' ? styles.selected : ''
            }`}
            onClick={() => handleRadioChange('email')}
          >
            <input
              type="radio"
              name="communicationMethod"
              value="email"
              checked={formData.communicationMethod === 'email'}
              onChange={() => handleRadioChange('email')}
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
              formData.communicationMethod === 'text' ? styles.selected : ''
            }`}
            onClick={() => handleRadioChange('text')}
          >
            <input
              type="radio"
              name="communicationMethod"
              value="text"
              checked={formData.communicationMethod === 'text'}
              onChange={() => handleRadioChange('text')}
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
          onClick={handleNext}
          disabled={!isFormValid()}
          className={`${styles.button} ${styles.primaryButton} ${
            !isFormValid() ? styles.disabled : ''
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
