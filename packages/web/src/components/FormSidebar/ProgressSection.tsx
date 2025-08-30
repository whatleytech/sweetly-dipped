import styles from "./ProgressSection.module.css";

interface ProgressSectionProps {
  completedStepsCount: number;
  totalSteps: number;
}

export const ProgressSection = ({
  completedStepsCount,
  totalSteps,
}: ProgressSectionProps) => {
  return (
    <div className={styles.progressInfo}>
      <div className={styles.progressText}>
        {completedStepsCount} of {totalSteps} steps completed
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${(completedStepsCount / totalSteps) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
