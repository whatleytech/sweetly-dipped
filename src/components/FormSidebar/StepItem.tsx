import styles from "./StepItem.module.css";
import type { FormStep } from "../../utils/formStepUtils";
import { getStepSummary } from "../../utils/formSummaryUtils";
import type { FormData } from "../../types/formTypes";

interface StepItemProps {
  step: FormStep;
  index: number;
  status: "completed" | "current" | "pending";
  isClickable: boolean;
  isCompleted: boolean;
  formData: FormData;
  onStepClick: (stepIndex: number) => void;
}

export const StepItem = ({
  step,
  index,
  status,
  isClickable,
  isCompleted,
  formData,
  onStepClick,
}: StepItemProps) => {
  const summary = getStepSummary(step.id, formData);

  return (
    <div
      className={`${styles.stepItem} ${styles[status]} ${
        isClickable ? styles.clickable : ""
      } ${isCompleted ? styles.hasData : ""}`}
      onClick={() => onStepClick(index)}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className={styles.stepHeader}>
        <span className={styles.stepNumber}>{index + 1}</span>
        <span className={styles.stepTitle}>{step.title}</span>
      </div>

      {summary && <div className={styles.stepSummary}>{summary}</div>}
    </div>
  );
};
