import React, { useState, useEffect } from 'react';
import styles from './FormSteps.module.css';
import type { FormStepProps, FormData } from '@/types/formTypes';
import { FormButtons, FormStepContainer } from '@/components/shared';

export const LeadQuestions = ({
  formData,
  updateFormData,
  onNext,
}: FormStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation functions
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2)
          return 'First name must be at least 2 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          return 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2)
          return 'Last name must be at least 2 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^\d{3}-\d{3}-\d{4}$/.test(value.trim())) {
          return 'Please enter a valid phone number (123-456-7890)';
        }
        break;
    }
    return '';
  };

  // Handle input changes with validation
  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Special handling for phone formatting
      if (field === 'phone') {
        const rawValue = value;
        const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 10);

        const formatPhone = (digits: string): string => {
          if (digits.length <= 3) return digits;
          if (digits.length <= 6)
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
          return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
        };

        const formattedValue = formatPhone(digitsOnly);
        updateFormData({ phone: formattedValue });

        // Validate the formatted value
        const error = validateField(field, formattedValue);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
        return;
      }

      // Update form data
      updateFormData({ [field]: value });

      // Validate the field
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    };

  // Handle input blur to mark as touched
  const handleInputBlur = (field: keyof FormData) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    newErrors.firstName = validateField('firstName', formData.firstName);
    newErrors.lastName = validateField('lastName', formData.lastName);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== '');
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    const hasAllRequiredValues =
      !!formData.firstName.trim() &&
      !!formData.lastName.trim() &&
      !!formData.email.trim() &&
      !!formData.phone.trim();

    if (!hasAllRequiredValues) return false;

    // Check if there are any validation errors for the required fields
    const hasErrors =
      errors.firstName || errors.lastName || errors.email || errors.phone;

    return !hasErrors;
  };

  // Validate on form data changes
  useEffect(() => {
    // Only validate fields that have been touched
    const newErrors: Record<string, string> = {};

    Object.keys(touched).forEach((field) => {
      if (touched[field as keyof FormData]) {
        const value = formData[field as keyof FormData];
        // Only validate string fields
        if (typeof value === 'string') {
          newErrors[field] = validateField(field, value);
        }
      }
    });

    setErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));
  }, [formData, touched]);

  // Handle next button click with validation
  const handleNext = () => {
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    });

    // Validate all fields
    if (validateAllFields()) {
      onNext();
    }
  };

  return (
    <FormStepContainer
      title="Let's start with your contact information"
      description="We'll use this information to confirm your order and keep you updated on your treats!"
    >
      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="firstName" className={styles.label}>
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            onBlur={handleInputBlur('firstName')}
            className={`${styles.input} ${errors.firstName && touched.firstName ? styles.inputError : ''}`}
            placeholder="Enter your first name"
            aria-invalid={!!errors.firstName && touched.firstName}
            aria-describedby={
              errors.firstName && touched.firstName
                ? 'firstName-error'
                : undefined
            }
            required
          />
          {errors.firstName && touched.firstName && (
            <div
              id="firstName-error"
              className={styles.errorMessage}
              role="alert"
              aria-live="polite"
            >
              {errors.firstName}
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="lastName" className={styles.label}>
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            onBlur={handleInputBlur('lastName')}
            className={`${styles.input} ${errors.lastName && touched.lastName ? styles.inputError : ''}`}
            placeholder="Enter your last name"
            aria-invalid={!!errors.lastName && touched.lastName}
            aria-describedby={
              errors.lastName && touched.lastName ? 'lastName-error' : undefined
            }
            required
          />
          {errors.lastName && touched.lastName && (
            <div
              id="lastName-error"
              className={styles.errorMessage}
              role="alert"
              aria-live="polite"
            >
              {errors.lastName}
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            onBlur={handleInputBlur('email')}
            className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
            placeholder="Enter your email address"
            aria-invalid={!!errors.email && touched.email}
            aria-describedby={
              errors.email && touched.email ? 'email-error' : undefined
            }
            required
          />
          {errors.email && touched.email && (
            <div
              id="email-error"
              className={styles.errorMessage}
              role="alert"
              aria-live="polite"
            >
              {errors.email}
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="phone" className={styles.label}>
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            pattern="\\d{3}-\\d{3}-\\d{4}"
            maxLength={12}
            value={formData.phone}
            onChange={handleInputChange('phone')}
            onBlur={handleInputBlur('phone')}
            className={`${styles.input} ${errors.phone && touched.phone ? styles.inputError : ''}`}
            placeholder="123-456-7890"
            aria-invalid={!!errors.phone && touched.phone}
            aria-describedby={
              errors.phone && touched.phone ? 'phone-error' : undefined
            }
            required
          />
          {errors.phone && touched.phone && (
            <div
              id="phone-error"
              className={styles.errorMessage}
              role="alert"
              aria-live="polite"
            >
              {errors.phone}
            </div>
          )}
        </div>
      </div>

      <FormButtons
        onNext={handleNext}
        isFirstStep={true}
        isLastStep={false}
        isValid={isFormValid()}
      />
    </FormStepContainer>
  );
};
