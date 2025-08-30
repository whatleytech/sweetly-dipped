import styles from "@/components/FormSteps/FormSteps.module.css";

interface FormButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isValid?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  submitLabel?: string;
}

export const FormButtons = ({
  onPrev,
  onNext,
  onSubmit,
  isValid = true,
  isFirstStep = false,
  isLastStep = false,
  nextLabel = "Continue →",
  prevLabel = "← Back",
  submitLabel = "Submit Order",
}: FormButtonsProps) => {
  const handlePrimaryAction = () => {
    if (isLastStep && onSubmit) {
      onSubmit();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div className={styles.buttonContainer}>
      {!isFirstStep && onPrev && (
        <button
          type="button"
          onClick={onPrev}
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          {prevLabel}
        </button>
      )}
      <button
        type="button"
        onClick={handlePrimaryAction}
        disabled={!isValid}
        className={`${styles.button} ${styles.primaryButton} ${
          !isValid ? styles.disabled : ""
        }`}
      >
        {isLastStep ? submitLabel : nextLabel}
      </button>
    </div>
  );
};
