import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.progressInfo}>
        <span className={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </span>
        <span className={styles.percentageText}>
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Step ${currentStep} of ${totalSteps}`}
        />
      </div>
    </div>
  );
};
