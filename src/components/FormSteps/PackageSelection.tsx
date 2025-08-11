import styles from "./FormSteps.module.css";
import type { FormStepProps, FormData } from "../../types/formTypes";
import { FormButtons, FormStepContainer } from "../shared";
import { PACKAGE_OPTIONS } from "../../constants/formData";

export const PackageSelection = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  onSubmit,
}: FormStepProps) => {
  const handleSelect = (id: FormData["packageType"]) => {
    updateFormData({ packageType: id });
  };

  const isValid = formData.packageType !== "";

  return (
    <FormStepContainer
      title="Which package would you like to order?"
      description="All packages include your choice to decide how many of each type of treat (pretzels, marshmallow pops, Rice Krispies, or Oreos). We'll confirm your selection via email."
    >
      <div className={styles.formFields}>
        <div className={styles.radioGroup}>
          {PACKAGE_OPTIONS.map((opt) => {
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
                    {opt.label} {opt.price ? `— $${opt.price}` : ""}
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
