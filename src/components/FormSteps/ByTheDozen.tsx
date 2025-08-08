import React from 'react';
import styles from './FormSteps.module.css';
import type { FormData } from '../../pages/DesignPackagePage';

interface FormStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const quantities = [0, 1, 2, 3, 4] as const; // 0 means none

const treatRows: Array<{
  key: keyof Pick<
    FormData,
    "riceKrispies" | "oreos" | "pretzels" | "marshmallows"
  >;
  label: string;
  price: number;
}> = [
  { key: "riceKrispies", label: "Chocolate covered Rice Krispies", price: 40 },
  { key: "oreos", label: "Chocolate covered Oreos", price: 30 },
  { key: "pretzels", label: "Chocolate dipped pretzels", price: 30 },
  {
    key: "marshmallows",
    label: "Chocolate covered marshmallow pops",
    price: 40,
  },
];

export const ByTheDozen = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: FormStepProps) => {
  const handleSelect = (
    key: keyof Pick<
      FormData,
      "riceKrispies" | "oreos" | "pretzels" | "marshmallows"
    >,
    value: number
  ) => {
    updateFormData({ [key]: value } as Partial<FormData>);
  };

  const hasAnySelection =
    (formData.riceKrispies ?? 0) +
      (formData.oreos ?? 0) +
      (formData.pretzels ?? 0) +
      (formData.marshmallows ?? 0) >
    0;

  const handleContinue = () => {
    if (hasAnySelection) onNext();
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.questionSection}>
        <h3 className={styles.questionTitle}>
          Which treat(s) would you like to order by the dozen?
        </h3>
        <p className={styles.questionDescription}>
          $30/dozen for Oreos or pretzels. $40/dozen for Rice Krispies or
          marshmallow pops.
        </p>
      </div>

      <div className={styles.gridHeader}>
        <div className={styles.gridHeaderCell}>Treat</div>
        {quantities.slice(1).map((q) => (
          <div key={q} className={styles.gridHeaderCell}>
            {q} dozen
          </div>
        ))}
      </div>

      {treatRows.map((row) => (
        <div key={row.key} className={styles.gridRow}>
          <div className={styles.gridRowLabel}>
            {row.label} — ${row.price}/dozen
          </div>
          {quantities.slice(1).map((q) => {
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
                />
                <span className={styles.gridRadioLabel}>{q}</span>
              </label>
            );
          })}
        </div>
      ))}

      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={onPrev}
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasAnySelection}
          className={`${styles.button} ${styles.primaryButton} ${
            !hasAnySelection ? styles.disabled : ""
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
