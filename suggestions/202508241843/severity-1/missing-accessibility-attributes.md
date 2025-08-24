# Missing Accessibility Attributes in Form Components

**Severity:** 1  
**File:** `src/components/FormSteps/LeadQuestions.tsx`

## Problem

Form inputs lack proper accessibility attributes:

```tsx
<input
  id="firstName"
  type="text"
  value={formData.firstName}
  onChange={handleInputChange("firstName")}
  className={styles.input}
  placeholder="Enter your first name"
  required
/>
```

## Why It's Problematic

- Missing aria-describedby for error messages
- No aria-invalid state management
- Incomplete accessibility implementation
- Doesn't meet WCAG standards

## Suggested Fix

Add comprehensive accessibility attributes:

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

- Improves screen reader compatibility
- Provides better error feedback
- Meets accessibility standards
- Enhances user experience for all users
