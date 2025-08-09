import styles from "../FormSteps/FormSteps.module.css";

interface FormStepContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const FormStepContainer = ({
  title,
  description,
  children,
}: FormStepContainerProps) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.questionSection}>
        <h3 className={styles.questionTitle}>{title}</h3>
        <p className={styles.questionDescription}>{description}</p>
      </div>
      {children}
    </div>
  );
};
