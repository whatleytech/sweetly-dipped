# Form State Migration

## Data Migration Strategy

When the `FormData` interface changes, implement a migration strategy to handle existing localStorage data:

### Migration Pattern

```typescript
// In useEffect for loading from localStorage
useEffect(() => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      
      // Create default FormData with all current properties
      const defaultFormData: FormData = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        communicationMethod: "",
        packageType: "",
        riceKrispies: 0,
        oreos: 0,
        pretzels: 0,
        marshmallows: 0,
        colorScheme: "",
        eventType: "",
        theme: "",
        additionalDesigns: "",
        pickupDate: "",
        pickupTimeWindow: "",
        pickupTime: "",
        rushOrder: false,
        // Add any new properties with default values
      };
      
      // Merge saved data over defaults
      const migratedFormData: FormData = {
        ...defaultFormData,
        ...parsedData.formData, // Override with saved data
      };
      
      setFormData(migratedFormData);
      setCurrentStep(parsedData.currentStep || 0);
    } catch (error) {
      console.error("Error loading form data:", error);
      localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
    }
  }
}, []);
```

### Implementation Rules

1. **Always provide defaults**: Create a complete `FormData` object with all current properties
2. **Spread saved data last**: Use `...parsedData.formData` to override defaults with saved values
3. **Handle corruption**: Remove corrupted localStorage data and start fresh
4. **Type safety**: Ensure migrated data matches current `FormData` interface
5. **Test migration**: Add test cases for old data format migration

### Testing Migration

```typescript
it("migrates old localStorage data missing new properties", () => {
  const oldSavedData = {
    formData: {
      firstName: "John",
      lastName: "Doe",
      // Missing newer properties
    },
    currentStep: 2
  };
  
  localStorageMock.getItem.mockReturnValue(JSON.stringify(oldSavedData));
  render(<Component />);
  
  // Verify old data loaded
  expect(screen.getByDisplayValue("John")).toBeInTheDocument();
  
  // Verify new properties added with defaults
  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    STORAGE_KEY,
    expect.stringContaining('"pickupTimeWindow":""')
  );
});
```

### Version Tracking (Optional)

For complex migrations, consider adding a version field:

```typescript
interface StoredFormData {
  version: number;
  formData: FormData;
  currentStep: number;
}

// Migration logic based on version
if (parsedData.version < 2) {
  // Migrate from version 1 to 2
  migratedFormData.pickupTimeWindow = "";
  migratedFormData.rushOrder = false;
}
```

### Best Practices

1. **Backward compatibility**: Always handle missing properties gracefully
2. **Error recovery**: Clear corrupted data and start fresh
3. **User experience**: Don't lose user progress due to data format changes
4. **Testing**: Test migration with various old data formats
5. **Documentation**: Comment migration logic for future developers
