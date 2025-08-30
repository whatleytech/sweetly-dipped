import styles from "./FormSteps.module.css";
import type { FormStepProps } from "@/types/formTypes";
import { FormButtons, FormStepContainer } from "@/components/shared";
import { QUANTITIES, TREAT_OPTIONS } from "@/constants/formData";

export const ByTheDozen = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps) => {
  const handleSelect = (
    key: keyof Pick<
      FormData,
      "riceKrispies" | "oreos" | "pretzels" | "marshmallows"
    >,
    value: number
  ) => {
    // If the same value is already selected, unselect it (set to 0)
    const currentValue = formData[key] ?? 0;
    const newValue = currentValue === value ? 0 : value;
    updateFormData({ [key]: newValue } as Partial<FormData>);
  };

  const hasAnySelection =
    (formData.riceKrispies ?? 0) +
      (formData.oreos ?? 0) +
      (formData.pretzels ?? 0) +
      (formData.marshmallows ?? 0) >
    0;

  return (
    <FormStepContainer
      title="Which treat(s) would you like to order by the dozen?"
      description="$30/dozen for Oreos or pretzels. $40/dozen for Rice Krispies or marshmallow pops."
    >
      <div className={styles.gridHeader}>
        <div className={styles.gridHeaderCell}>Treat</div>
        {QUANTITIES.slice(1).map((q) => (
          <div key={q} className={styles.gridHeaderCell}>
            {q} dozen
          </div>
        ))}
      </div>

      {TREAT_OPTIONS.map((row) => (
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
                  selected ? styles.selected : ""
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
