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

export const LeadQuestions = ({ formData, updateFormData, onNext }: FormStepProps) => {
  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFormData({ [field]: e.target.value });
    };

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.phone.trim()
    );
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
          Let's start with your contact information
        </h3>
        <p className={styles.questionDescription}>
          We'll use this information to confirm your order and keep you updated
          on your treats!
        </p>
      </div>

      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="firstName" className={styles.label}>
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange("firstName")}
            className={styles.input}
            placeholder="Enter your first name"
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="lastName" className={styles.label}>
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange("lastName")}
            className={styles.input}
            placeholder="Enter your last name"
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className={styles.input}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="phone" className={styles.label}>
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange("phone")}
            className={styles.input}
            placeholder="Enter your phone number"
            required
          />
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isFormValid()}
          className={`${styles.button} ${styles.primaryButton} ${
            !isFormValid() ? styles.disabled : ""
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
