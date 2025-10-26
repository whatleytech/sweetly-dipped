import styles from "./ReferralSource.module.css";
import type { FormData } from "@/types/formTypes";

interface ReferralSourceProps {
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
}

const REFERRAL_OPTIONS = [
  "Instagram",
  "Tiktok",
  "Returning customer",
  "Referral",
  "Other",
] as const;

export const ReferralSource = ({ formData, onUpdate }: ReferralSourceProps) => {
  return (
    <div className={styles.section}>
      <h3>How did you hear about us?*</h3>
      <div className={styles.fieldGroup}>
        <label htmlFor="referral-source">Referral Source:</label>
        <select
          id="referral-source"
          value={formData.referralSource || ''}
          onChange={(e) => onUpdate({ referralSource: e.target.value })}
          className={styles.referralSelect}
        >
          <option value="">Select an option...</option>
          {REFERRAL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
