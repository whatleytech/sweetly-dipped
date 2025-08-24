# Missing Loading States in Form Components

**Severity:** 2  
**File:** `src/pages/DesignPackagePage.tsx`

## Problem

Form submission lacks loading state management:

```tsx
const handleSubmit = () => {
  console.log("Submit button clicked - navigating to confirmation page");
  // Navigate to confirmation page
  navigate("/confirmation");
};
```

## Why It's Problematic

- No loading state during form submission
- User can't see if their submission is being processed
- Potential for double submissions
- Poor user experience during API calls

## Suggested Fix

Implement loading state management:

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    // Submit form data
    await submitFormData(formData);
    navigate("/confirmation");
  } catch (error) {
    // Handle error
    console.error('Form submission failed:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

And update the submit button to show loading state:

```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className={styles.submitButton}
>
  {isSubmitting ? 'Submitting...' : 'Submit Order'}
</button>
```

## Why This Helps

- Prevents double submissions
- Provides visual feedback during processing
- Improves user experience
- Enables proper error handling
