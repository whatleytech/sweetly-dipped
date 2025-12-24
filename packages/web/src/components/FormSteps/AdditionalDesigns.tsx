import styles from "./FormSteps.module.css";
import type { FormStepProps, FormData } from "@/types/formTypes";
import { FormButtons, FormStepContainer } from "@/components/shared";
import { useAdditionalDesignOptions } from "@/hooks/useConfigQuery";
import { calculateDesignOptionPrice } from "@/utils/priceCalculations";

export const AdditionalDesigns = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps & { updateFormData: (updates: Partial<FormData>) => void }) => {
  const {
    data: options = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAdditionalDesignOptions();

  const handleToggle = (optionId: string) => {
    const current = formData.selectedAdditionalDesigns ?? [];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    updateFormData({ selectedAdditionalDesigns: updated });
  };

  if (isLoading) {
    return (
      <FormStepContainer
        title="Additional designs"
        description="Loading design options..."
      >
        <div>Loading...</div>
      </FormStepContainer>
    );
  }

  if (isError) {
    return (
      <FormStepContainer
        title="Additional designs"
        description="Error loading design options"
      >
        <div>
          <p>Failed to load design options: {error?.message}</p>
          <button type="button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </FormStepContainer>
    );
  }

  return (
    <FormStepContainer
      title="Additional designs"
      description="Base pricing includes your colors, drizzle, themed chocolate molds, and sprinkles. Select any additional custom design options below. Prices vary by package size."
    >
      <div className={styles.formFields}>
        {options.length > 0 ? (
          <div className={styles.checkboxGroup}>
            {options.map((option) => {
              const isSelected =
                formData.selectedAdditionalDesigns?.includes(option.id) ?? false;
              const displayPrice = calculateDesignOptionPrice(
                option,
                formData.packageType
              );

              // Create a slugified ID for E2E testing
              const checkboxId = `additional-design-${option.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

              return (
                <label
                  key={option.id}
                  className={`${styles.checkboxOption} ${
                    isSelected ? styles.selected : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    id={checkboxId}
                    checked={isSelected}
                    onChange={() => handleToggle(option.id)}
                    className={styles.checkboxInput}
                    aria-label={`Select ${option.name}`}
                  />
                  <div style={{ flex: 1 }}>
                    <span className={styles.checkboxLabel}>
                      {option.name} — ${displayPrice}
                    </span>
                    {option.description && (
                      <span className={styles.checkboxDescription}>
                        {option.description}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <p>No additional design options available at this time.</p>
        )}
      </div>

      <FormButtons
        onPrev={onPrev}
        onNext={onNext}
        onSubmit={onSubmit}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isValid={true} // This step is always valid (optional field)
      />
    </FormStepContainer>
  );
};
