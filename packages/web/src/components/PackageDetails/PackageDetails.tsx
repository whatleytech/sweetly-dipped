import styles from "./PackageDetails.module.css";
import type { FormData } from "@/types/formTypes";
import { usePackageOptions, useTreatOptions } from "@/hooks/useConfigQuery";

interface PackageDetailsProps {
  formData: FormData;
}

export const PackageDetails = ({ formData }: PackageDetailsProps) => {
  const { data: packageOptions = [] } = usePackageOptions();
  const { data: treatOptions = [] } = useTreatOptions();

  const getPackageLabel = (packageType: string) => {
    const option = packageOptions.find((opt) => opt.id === packageType);
    return option?.label || packageType;
  };

  const getPackagePrice = (packageType: string) => {
    const option = packageOptions.find((opt) => opt.id === packageType);
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
      const riceKrispiesPrice = treatOptions.find(t => t.key === 'riceKrispies')?.price || 40;
      const oreosPrice = treatOptions.find(t => t.key === 'oreos')?.price || 30;
      const pretzelsPrice = treatOptions.find(t => t.key === 'pretzels')?.price || 30;
      const marshmallowsPrice = treatOptions.find(t => t.key === 'marshmallows')?.price || 40;

      const riceKrispiesTotal = formData.riceKrispies * riceKrispiesPrice;
      const oreosTotal = formData.oreos * oreosPrice;
      const pretzelsTotal = formData.pretzels * pretzelsPrice;
      const marshmallowsTotal = formData.marshmallows * marshmallowsPrice;
      
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
