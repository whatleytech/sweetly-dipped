import styles from "./FormSteps.module.css";
import type { FormStepProps, FormData } from '@/types/formTypes';
import { FormButtons, FormStepContainer } from "@/components/shared";
import { QUANTITIES } from '@/constants/formData';
import { useTreatOptions } from '@/hooks/useConfigQuery';

export const ByTheDozen = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps & {
  updateFormData: (updates: Partial<FormData>) => void;
}) => {
  const {
    data: treatOptions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTreatOptions();
  const handleSelect = (
    key: 'riceKrispies' | 'oreos' | 'pretzels' | 'marshmallows',
    value: number
  ) => {
    // If the same value is already selected, unselect it (set to 0)
    const currentValue = formData[key] ?? 0;
    const newValue = currentValue === value ? 0 : value;
    updateFormData({ [key]: newValue });
  };

  const handleDropdownChange = (
    key: 'riceKrispies' | 'oreos' | 'pretzels' | 'marshmallows',
    value: number
  ) => {
    updateFormData({ [key]: value });
  };

  const getQuantityLabel = (quantity: number) => {
    if (quantity === 0) {
      return 'None';
    }
    if (quantity === 1) {
      return '1 dozen';
    }
    return `${quantity} dozen`;
  };

  const hasAnySelection =
    (formData.riceKrispies ?? 0) +
      (formData.oreos ?? 0) +
      (formData.pretzels ?? 0) +
      (formData.marshmallows ?? 0) >
    0;

  if (isLoading) {
    return (
      <FormStepContainer
        title="Which treat(s) would you like to order by the dozen?"
        description="Loading treat options..."
      >
        <div>Loading...</div>
      </FormStepContainer>
    );
  }

  if (isError) {
    return (
      <FormStepContainer
        title="Which treat(s) would you like to order by the dozen?"
        description="Error loading treat options"
      >
        <div>
          <p>Failed to load treat options: {error?.message}</p>
          <button type="button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </FormStepContainer>
    );
  }

  return (
    <FormStepContainer
      title="Which treat(s) would you like to order by the dozen?"
      description="Select the quantity for each treat you'd like to order. Prices are shown per dozen."
    >
      <div className={styles.desktopGrid}>
        <div className={styles.gridHeader}>
          <div className={styles.gridHeaderCell}>Treat</div>
          {QUANTITIES.slice(1).map((q) => (
            <div key={q} className={styles.gridHeaderCell}>
              {q} dozen
            </div>
          ))}
        </div>

        {treatOptions.map((row) => (
          <div key={row.key} className={styles.gridRow}>
            <div className={styles.gridRowLabel}>
              {row.label} — ${row.price}/dozen
            </div>
            {QUANTITIES.slice(1).map((q) => {
              const selected = (formData[row.key] ?? 0) === q;
              return (
                <label
                  key={q}
                  className={`${styles.gridRadioOption} ${
                    selected ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    className={styles.gridRadioInput}
                    name={row.key}
                    value={q}
                    checked={selected}
                    onChange={() => handleSelect(row.key, q)}
                    onClick={() => handleSelect(row.key, q)}
                  />
                  <span className={styles.gridRadioLabel}>{q}</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.mobileSelectContainer}>
        {treatOptions.map((row) => {
          const selectId = `${row.key}-quantity`;
          const currentValue = formData[row.key] ?? 0;

          return (
            <div key={row.key} className={styles.mobileTreatGroup}>
              <label htmlFor={selectId} className={styles.mobileTreatLabel}>
                {row.label} — ${row.price}/dozen
              </label>
              <select
                id={selectId}
                name={row.key}
                className={styles.mobileTreatSelect}
                value={currentValue}
                onChange={(event) =>
                  handleDropdownChange(row.key, Number(event.target.value))
                }
              >
                {QUANTITIES.map((quantity) => (
                  <option key={quantity} value={quantity}>
                    {getQuantityLabel(quantity)}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <FormButtons
        onPrev={onPrev}
        onNext={onNext}
        onSubmit={onSubmit}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isValid={hasAnySelection}
      />
    </FormStepContainer>
  );
};
