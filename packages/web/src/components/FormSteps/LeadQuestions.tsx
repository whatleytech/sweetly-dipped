import React, { useState, useEffect } from 'react';
import styles from './FormSteps.module.css';
import type { FormStepProps, FormData } from '@/types/formTypes';
import { FormButtons, FormStepContainer } from '@/components/shared';

interface LeadQuestionInputProps {
  id: string;
  label: string;
  type?: string;
  inputMode?:
    | 'text'
    | 'email'
    | 'search'
    | 'tel'
    | 'url'
    | 'none'
    | 'numeric'
    | 'decimal';
  placeholder: string;
  pattern?: string;
  maxLength?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  error?: string;
  touched: boolean;
}

const LeadQuestionInput = ({
  id,
  label,
  type = 'text',
  inputMode,
  placeholder,
  pattern,
  maxLength,
  value,
  onChange,
  onBlur,
  error,
  touched,
}: LeadQuestionInputProps) => (
  <div className={styles.fieldGroup}>
    <label htmlFor={id} className={styles.label}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      pattern={pattern}
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`${styles.input} ${error && touched ? styles.inputError : ''}`}
      placeholder={placeholder}
      aria-invalid={!!error && touched}
      aria-describedby={error && touched ? `${id}-error` : undefined}
      required
    />
    {error && touched && (
      <div
        id={`${id}-error`}
        className={styles.errorMessage}
        role="alert"
        aria-live="polite"
      >
        {error}
      </div>
    )}
  </div>
);

export const LeadQuestions = ({
  formData,
  updateFormData,
  onNext,
}: FormStepProps & { updateFormData: (updates: Partial<FormData>) => void }) => {
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
        <LeadQuestionInput
          id="first-name"
          label="First Name *"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleInputChange('firstName')}
          onBlur={handleInputBlur('firstName')}
          error={errors.firstName}
          touched={touched.firstName}
        />

        <LeadQuestionInput
          id="last-name"
          label="Last Name *"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleInputChange('lastName')}
          onBlur={handleInputBlur('lastName')}
          error={errors.lastName}
          touched={touched.lastName}
        />

        <LeadQuestionInput
          id="email"
          label="Email Address *"
          type="email"
          inputMode="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleInputChange('email')}
          onBlur={handleInputBlur('email')}
          error={errors.email}
          touched={touched.email}
        />

        <LeadQuestionInput
          id="phone"
          label="Phone Number *"
          type="tel"
          inputMode="tel"
          pattern="\\d{3}-\\d{3}-\\d{4}"
          maxLength={12}
          placeholder="123-456-7890"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          onBlur={handleInputBlur('phone')}
          error={errors.phone}
          touched={touched.phone}
        />
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
