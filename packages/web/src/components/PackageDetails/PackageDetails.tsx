import styles from "./PackageDetails.module.css";
import type { FormData } from "@/types/formTypes";
import {
  usePackageOptions,
  useTreatOptions,
  useAdditionalDesignOptions,
} from '@/hooks/useConfigQuery';
import { calculateAdditionalDesignsTotal } from '@/utils/priceCalculations';

interface PackageDetailsProps {
  formData: FormData;
}

interface PackageTypeFieldProps {
  value: string;
}

interface TreatBreakdownRow {
  label: string;
  value: number;
}

interface TreatBreakdownProps {
  rows: TreatBreakdownRow[];
  totalDozens: number;
}

interface PriceSummaryProps {
  total: number;
}

const PackageTypeField = ({ value }: PackageTypeFieldProps) => (
  <div className={styles.fieldGroup}>
    <label>Package Type:</label>
    <span className={styles.fieldValue}>{value}</span>
  </div>
);

const TreatBreakdown = ({ rows, totalDozens }: TreatBreakdownProps) => (
  <div className={`${styles.fieldGroup} ${styles.stackedFieldGroup}`}>
    <label className={styles.sectionLabel}>Treats Breakdown:</label>
    <div className={`${styles.table} ${styles.treatsBreakdown}`}>
      {rows.map((item) => (
        <div className={styles.tableRow} key={item.label}>
          <span className={styles.tableLabel}>{item.label}</span>{' '}
          <span className={styles.tableValue}>{item.value}</span>
        </div>
      ))}
      <div className={`${styles.tableRow} ${styles.tableTotal}`}>
        <span className={styles.tableLabel}>Total:</span>{' '}
        <span className={styles.tableValue}>{totalDozens} dozen</span>
      </div>
    </div>
  </div>
);

const PriceSummary = ({ total }: PriceSummaryProps) => {
  const half = total / 2;

  return (
    <div className={styles.table}>
      <div className={styles.tableRow}>
        <span className={styles.tableLabel}>Deposit due within 48 hours:</span>{' '}
        <span className={`${styles.tableValue} ${styles.priceBreakdown}`}>
          ${half}
        </span>
      </div>
      <div className={styles.tableRow}>
        <span className={styles.tableLabel}>
          Remainder due 1 week before event:
        </span>{' '}
        <span className={`${styles.tableValue} ${styles.priceBreakdown}`}>
          ${half}
        </span>
      </div>
      <div className={`${styles.tableRow} ${styles.tableTotal}`}>
        <span className={styles.tableLabel}>Total:</span>{' '}
        <span className={`${styles.tableValue} ${styles.totalPrice}`}>
          ${total}
        </span>
      </div>
    </div>
  );
};

export const PackageDetails = ({ formData }: PackageDetailsProps) => {
  const { data: packageOptions = [] } = usePackageOptions();
  const { data: treatOptions = [] } = useTreatOptions();
  const { data: designOptions = [] } = useAdditionalDesignOptions();

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
    let baseTotal = 0;

    if (formData.packageType === 'by-dozen') {
      // Calculate total for by-dozen orders
      const riceKrispiesPrice =
        treatOptions.find((t) => t.key === 'riceKrispies')?.price || 40;
      const oreosPrice =
        treatOptions.find((t) => t.key === 'oreos')?.price || 30;
      const pretzelsPrice =
        treatOptions.find((t) => t.key === 'pretzels')?.price || 30;
      const marshmallowsPrice =
        treatOptions.find((t) => t.key === 'marshmallows')?.price || 40;

      const riceKrispiesTotal = formData.riceKrispies * riceKrispiesPrice;
      const oreosTotal = formData.oreos * oreosPrice;
      const pretzelsTotal = formData.pretzels * pretzelsPrice;
      const marshmallowsTotal = formData.marshmallows * marshmallowsPrice;

      baseTotal =
        riceKrispiesTotal + oreosTotal + pretzelsTotal + marshmallowsTotal;
    } else {
      // Return package price for pre-defined packages
      baseTotal = getPackagePrice(formData.packageType);
    }

    // Add additional designs total
    const additionalDesignsTotal = calculateAdditionalDesignsTotal(
      formData.selectedAdditionalDesigns ?? [],
      designOptions,
      formData.packageType
    );

    return baseTotal + additionalDesignsTotal;
  };

  const total = calculateTotal();
  const additionalDesignsTotal = calculateAdditionalDesignsTotal(
    formData.selectedAdditionalDesigns ?? [],
    designOptions,
    formData.packageType
  );

  const treatRows: TreatBreakdownRow[] = [
    { label: 'Rice Krispies:', value: formData.riceKrispies },
    { label: 'Oreos:', value: formData.oreos },
    { label: 'Pretzels:', value: formData.pretzels },
    { label: 'Marshmallows:', value: formData.marshmallows },
  ];

  return (
    <div className={styles.section}>
      <h3>Package Details</h3>
      <PackageTypeField value={getPackageLabel(formData.packageType)} />

      {formData.packageType === 'by-dozen' && (
        <TreatBreakdown rows={treatRows} totalDozens={getTotalByDozen()} />
      )}

      {additionalDesignsTotal > 0 && (
        <div className={styles.fieldGroup}>
          <div className={styles.table}>
            <div className={styles.tableRow}>
              <span className={styles.tableLabel}>Additional Designs:</span>
              <span className={styles.tableValue}>
                ${additionalDesignsTotal}
              </span>
            </div>
          </div>
        </div>
      )}

      <PriceSummary total={total} />
    </div>
  );
};
