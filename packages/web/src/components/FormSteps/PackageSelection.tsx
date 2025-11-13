import styles from './FormSteps.module.css';
import type { FormStepProps, FormData } from '@/types/formTypes';
import { FormButtons, FormStepContainer } from '@/components/shared';
import { usePackageOptions } from '@/hooks/useConfigQuery';

export const PackageSelection = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps & { updateFormData: (updates: Partial<FormData>) => void }) => {
  const { data: packageOptions = [], isLoading, isError, error, refetch } = usePackageOptions();

  const handleSelect = (id: FormData['packageType']) => {
    updateFormData({ packageType: id });
  };

  const isValid = formData.packageType !== '';

  if (isLoading) {
    return (
      <FormStepContainer
        title="Which package would you like to order?"
        description="Loading package options..."
      >
        <div>Loading...</div>
      </FormStepContainer>
    );
  }

  if (isError) {
    return (
      <FormStepContainer
        title="Which package would you like to order?"
        description="Error loading package options"
      >
        <div>
          <p>Failed to load package options: {error?.message}</p>
          <button type="button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </FormStepContainer>
    );
  }

  return (
    <FormStepContainer
      title="Which package would you like to order?"
      description="All packages include your choice to decide how many of each type of treat (pretzels, marshmallow pops, Rice Krispies, or Oreos). We'll confirm your selection via email."
    >
      <div className={styles.formFields}>
        <div className={styles.radioGroup}>
          {packageOptions.map((opt) => {
            const selected = formData.packageType === opt.id;
            return (
              <div
                key={opt.id}
                className={`${styles.radioOption} ${
                  selected ? styles.selected : ''
                }`}
                onClick={() => handleSelect(opt.id)}
                role="radio"
                aria-checked={selected}
              >
                <input
                  id={opt.id}
                  type="radio"
                  name="packageType"
                  value={opt.id}
                  checked={selected}
                  onChange={() => handleSelect(opt.id)}
                  className={styles.radioInput}
                />
                <div>
                  <label htmlFor={opt.id} className={styles.radioLabel}>
                    {opt.label} {opt.price ? `— $${opt.price}` : ''}
                  </label>
                  {opt.description && (
                    <div className={styles.radioDescription}>
                      {opt.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <FormButtons
        onPrev={onPrev}
        onNext={onNext}
        onSubmit={onSubmit}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isValid={isValid}
      />
    </FormStepContainer>
  );
};
