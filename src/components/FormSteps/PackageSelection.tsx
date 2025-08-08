import styles from "./FormSteps.module.css";
import type { FormData } from "../../pages/DesignPackagePage";

interface FormStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const packageOptions: Array<{
  id: FormData["packageType"];
  label: string;
  description?: string;
  price?: string;
}> = [
  { id: "small", label: "Small (3 dozen – 36 treats)", price: "$110" },
  { id: "medium", label: "Medium (5 dozen – 60 treats)", price: "$180" },
  { id: "large", label: "Large (8 dozen – 96 treats)", price: "$280" },
  {
    id: "xl",
    label: "XL (12 dozen – 144 treats)",
    price: "$420",
    description: "Requires at least one month notice",
  },
  { id: "by-dozen", label: "No package — order by the dozen" },
];

export const PackageSelection = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: FormStepProps) => {
  const handleSelect = (id: FormData["packageType"]) => {
    updateFormData({ packageType: id });
  };

  const isValid = formData.packageType !== "";

  const handleContinue = () => {
    if (isValid) onNext();
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.questionSection}>
        <h3 className={styles.questionTitle}>
          Which package would you like to order?
        </h3>
        <p className={styles.questionDescription}>
          All packages include your choice to decide how many of each type of
          treat (pretzels, marshmallow pops, Rice Krispies, or Oreos). We'll
          confirm your selection via email.
        </p>
      </div>

      <div className={styles.formFields}>
        <div className={styles.radioGroup}>
          {packageOptions.map((opt) => {
            const selected = formData.packageType === opt.id;
            return (
              <div
                key={opt.id}
                className={`${styles.radioOption} ${
                  selected ? styles.selected : ""
                }`}
                onClick={() => handleSelect(opt.id)}
                role="radio"
                aria-checked={selected}
              >
                <input
                  type="radio"
                  name="packageType"
                  value={opt.id}
                  checked={selected}
                  onChange={() => handleSelect(opt.id)}
                  className={styles.radioInput}
                />
                <div>
                  <label className={styles.radioLabel}>
                    {opt.label} {opt.price ? `— ${opt.price}` : ""}
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
          disabled={!isValid}
          className={`${styles.button} ${styles.primaryButton} ${
            !isValid ? styles.disabled : ""
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
