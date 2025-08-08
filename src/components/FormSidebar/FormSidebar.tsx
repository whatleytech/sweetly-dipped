import styles from "./FormSidebar.module.css";
import type { FormData } from "../../pages/DesignPackagePage";

interface FormSidebarProps {
  formData: FormData;
  currentStep: number;
  formSteps: Array<{ id: string; title: string }>;
}

export const FormSidebar = ({
  formData,
  currentStep,
  formSteps,
}: FormSidebarProps) => {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "pending";
  };

  const getStepSummary = (stepId: string) => {
    switch (stepId) {
      case "lead":
        if (
          formData.firstName ||
          formData.lastName ||
          formData.email ||
          formData.phone
        ) {
          return (
            `${formData.firstName} ${formData.lastName}`.trim() ||
            formData.email ||
            "Contact info provided"
          );
        }
        return null;

      case "communication":
        if (formData.communicationMethod) {
          return formData.communicationMethod === "email" ? "Email" : "Text";
        }
        return null;

      case "package":
        if (formData.packageType) {
          const packageNames = {
            small: "Small Package (3 dozen)",
            medium: "Medium Package (5 dozen)",
            large: "Large Package (8 dozen)",
            xl: "XL Package (12 dozen)",
            "by-dozen": "By The Dozen",
          };
          return packageNames[formData.packageType] || null;
        }
        return null;

      case "by-dozen":
        if (formData.packageType === "by-dozen") {
          const items = [];
          if (formData.riceKrispies > 0)
            items.push(`${formData.riceKrispies} Rice Krispies`);
          if (formData.oreos > 0) items.push(`${formData.oreos} Oreos`);
          if (formData.pretzels > 0)
            items.push(`${formData.pretzels} Pretzels`);
          if (formData.marshmallows > 0)
            items.push(`${formData.marshmallows} Marshmallows`);
          return items.length > 0 ? items.join(", ") : null;
        }
        return null;

      case "color":
        return formData.colorScheme || null;

      case "event": {
        const eventDetails: string[] = [];
        if (formData.eventType) eventDetails.push(formData.eventType);
        if (formData.theme) eventDetails.push(formData.theme);
        return eventDetails.length > 0 ? eventDetails.join(", ") : null;
      }

      case "designs":
        return formData.additionalDesigns || null;

      case "pickup":
        if (formData.pickupDate && formData.pickupTime) {
          return `${formData.pickupDate} at ${formData.pickupTime}`;
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className={styles.sidebar}>
      <h3 className={styles.title}>Your Progress</h3>

      <div className={styles.stepsList}>
        {formSteps.map((step, index) => {
          const status = getStepStatus(index);
          const summary = getStepSummary(step.id);

          return (
            <div
              key={step.id}
              className={`${styles.stepItem} ${styles[status]}`}
            >
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <span className={styles.stepTitle}>{step.title}</span>
              </div>

              {summary && <div className={styles.stepSummary}>{summary}</div>}
            </div>
          );
        })}
      </div>

      <div className={styles.progressInfo}>
        <div className={styles.progressText}>
          {currentStep + 1} of {formSteps.length} steps completed
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${((currentStep + 1) / formSteps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
