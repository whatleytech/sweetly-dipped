import styles from "./DesignDetails.module.css";
import type { FormData } from "../../types/formTypes";

interface DesignDetailsProps {
  formData: FormData;
}

export const DesignDetails = ({ formData }: DesignDetailsProps) => {
  return (
    <div className={styles.section}>
      <h3>Design Details</h3>
      
      <div className={styles.fieldGroup}>
        <label>Color Scheme:</label>
        <span className={styles.fieldValue}>
          {formData.colorScheme || "Not specified"}
        </span>
      </div>

      <div className={styles.fieldGroup}>
        <label>Event Type:</label>
        <span className={styles.fieldValue}>
          {formData.eventType || "Not specified"}
        </span>
      </div>

      <div className={styles.fieldGroup}>
        <label>Theme:</label>
        <span className={styles.fieldValue}>
          {formData.theme || "Not specified"}
        </span>
      </div>

      {formData.additionalDesigns && (
        <div className={styles.fieldGroup}>
          <label>Additional Design Notes:</label>
          <span className={styles.fieldValue}>
            {formData.additionalDesigns}
          </span>
        </div>
      )}
    </div>
  );
};
