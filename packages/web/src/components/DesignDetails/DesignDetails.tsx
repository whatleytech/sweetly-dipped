import styles from "./DesignDetails.module.css";
import type { FormData } from "@/types/formTypes";
import { useAdditionalDesignOptions } from '@/hooks/useConfigQuery';

interface DesignDetailsProps {
  formData: FormData;
}

export const DesignDetails = ({ formData }: DesignDetailsProps) => {
  const { data: designOptions } = useAdditionalDesignOptions();

  // Display selected designs by name:
  const selectedNames = formData.selectedAdditionalDesigns
    ?.map((id) => designOptions?.find((opt) => opt.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div className={styles.section}>
      <h3>Design Details</h3>

      <div className={styles.fieldGroup}>
        <label>Color Scheme:</label>
        <span className={styles.fieldValue}>
          {formData.colorScheme || 'Not specified'}
        </span>
      </div>

      <div className={styles.fieldGroup}>
        <label>Event Type:</label>
        <span className={styles.fieldValue}>
          {formData.eventType || 'Not specified'}
        </span>
      </div>

      <div className={styles.fieldGroup}>
        <label>Theme:</label>
        <span className={styles.fieldValue}>
          {formData.theme || 'Not specified'}
        </span>
      </div>

      {selectedNames && (
        <div className={styles.fieldGroup}>
          <label>Additional Designs:</label>
          <span className={styles.fieldValue}>{selectedNames}</span>
        </div>
      )}
    </div>
  );
};
