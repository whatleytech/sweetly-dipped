import styles from "./PickupDetails.module.css";
import type { FormData } from "@/types/formTypes";

interface PickupDetailsProps {
  formData: FormData;
}

export const PickupDetails = ({ formData }: PickupDetailsProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.section}>
      <h3>Pickup Details</h3>

      <div className={styles.fieldGroup}>
        <label>Pickup Date:</label>
        <span className={styles.fieldValue}>
          {formatDate(formData.pickupDate)}
        </span>
      </div>

      <div className={styles.fieldGroup}>
        <label>Pickup Time:</label>
        <span className={styles.fieldValue}>{formData.pickupTime}</span>
      </div>
    </div>
  );
};
