# Missing Input Validation in Form Components

**Severity:** 3  
**File:** `src/components/FormSteps/LeadQuestions.tsx`

## Problem

Form validation is basic and lacks proper error messaging:

```tsx
const isValidEmail = (email: string): boolean => {
  // Basic RFC 5322-inspired email pattern good enough for client-side checks
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};
```

The component doesn't provide real-time validation feedback or accessibility error messaging.

## Why It's Problematic

- Basic regex doesn't catch all invalid email formats
- No server-side validation backup
- Missing accessibility error messaging
- No real-time validation feedback

## Suggested Fix

Implement comprehensive validation with error state management:

```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (field: string, value: string): string => {
  switch (field) {
    case 'email':
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      break;
    case 'phone':
      if (!value) return 'Phone number is required';
      if (!/^\d{3}-\d{3}-\d{4}$/.test(value)) {
        return 'Please enter a valid phone number (123-456-7890)';
      }
      break;
  }
  return '';
};

const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  const error = validateField(field, value);
  
  setErrors(prev => ({
    ...prev,
    [field]: error
  }));
  
  updateFormData({ [field]: value });
};
```

And update the input fields with proper accessibility attributes:

```tsx
<input
  id="firstName"
  type="text"
  value={formData.firstName}
  onChange={handleInputChange("firstName")}
  className={styles.input}
  placeholder="Enter your first name"
  aria-invalid={!!errors.firstName}
  aria-describedby={errors.firstName ? "firstName-error" : undefined}
  required
/>
{errors.firstName && (
  <div id="firstName-error" className={styles.errorMessage} role="alert">
    {errors.firstName}
  </div>
)}
```

## Why This Helps

- Provides immediate validation feedback
- Improves user experience with clear error messages
- Maintains accessibility with proper ARIA attributes
- Reduces form submission errors
