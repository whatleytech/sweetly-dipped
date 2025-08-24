import styles from "./PackageDetails.module.css";
import type { FormData } from "@/types/formTypes";
import { PACKAGE_OPTIONS } from "@/constants/formData";

interface PackageDetailsProps {
  formData: FormData;
}

export const PackageDetails = ({ formData }: PackageDetailsProps) => {
  const getPackageLabel = (packageType: string) => {
    const option = PACKAGE_OPTIONS.find((opt) => opt.id === packageType);
    return option?.label || packageType;
  };

  const getPackagePrice = (packageType: string) => {
    const option = PACKAGE_OPTIONS.find((opt) => opt.id === packageType);
    return option?.price || 0;
  };

  const getTotalByDozen = () => {
    return (
      formData.riceKrispies +
      formData.oreos +
      formData.pretzels +
      formData.marshmallows
    );
  };

  const calculateTotal = () => {
    if (formData.packageType === "by-dozen") {
      // Calculate total for by-dozen orders
      const riceKrispiesTotal = formData.riceKrispies * 40;
      const oreosTotal = formData.oreos * 30;
      const pretzelsTotal = formData.pretzels * 30;
      const marshmallowsTotal = formData.marshmallows * 40;
      
      return riceKrispiesTotal + oreosTotal + pretzelsTotal + marshmallowsTotal;
    } else {
      // Return package price for pre-defined packages
      return getPackagePrice(formData.packageType);
    }
  };

  const total = calculateTotal();

  return (
    <div className={styles.section}>
      <h3>Package Details</h3>
      <div className={styles.fieldGroup}>
        <label>Package Type:</label>
        <span className={styles.fieldValue}>
          {getPackageLabel(formData.packageType)}
        </span>
      </div>

      {formData.packageType === "by-dozen" && (
        <div className={styles.fieldGroup}>
          <label>Treats Breakdown:</label>
          <div className={styles.treatsBreakdown}>
            <div>Rice Krispies: {formData.riceKrispies}</div>
            <div>Oreos: {formData.oreos}</div>
            <div>Pretzels: {formData.pretzels}</div>
            <div>Marshmallows: {formData.marshmallows}</div>
            <div className={styles.total}>Total: {getTotalByDozen()} dozen</div>
          </div>
        </div>
      )}

      <div className={styles.priceGroup}>
        <label>Deposit due within 48 hours:</label>
        <span className={styles.priceBreakdown}>${total / 2}</span>
      </div>
      <div className={styles.priceGroup}>
        <label>Remainder due 1 week before event:</label>
        <span className={styles.priceBreakdown}>${total / 2}</span>
      </div>
      <div className={styles.totalGroup}>
        <label>Total:</label>
        <span className={styles.totalPrice}>${total}</span>
      </div>
    </div>
  );
};
