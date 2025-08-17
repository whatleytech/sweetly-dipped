import styles from "./TermsAndConditions.module.css";
import type { FormData } from "../../types/formTypes";

interface TermsAndConditionsProps {
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
}

export const TermsAndConditions = ({ formData, onUpdate }: TermsAndConditionsProps) => {
  return (
    <div className={styles.termsSection}>
      <h3>Important Information</h3>

      <div className={styles.infoBox}>
        <p>
          After you complete this order form, we will contact you to go over
          details, availability, and to provide payment information.{" "}
          <strong>
            Completion of this form does NOT mean that your order is confirmed.
          </strong>{" "}
          You should hear from us within 48 hours.
        </p>
        <p>
          If you have any questions or concerns, feel free to contact us at{" "}
          <a href="mailto:sweetlydippedbyjas@gmail.com">
            sweetlydippedbyjas@gmail.com
          </a>
          . Thank you!!
        </p>
      </div>

      <div className={styles.termsBox}>
        <h4>Terms & Conditions</h4>
        <div className={styles.termsContent}>
          <p>
            Completing this form does NOT confirm your order. You will receive a
            response via EMAIL within 48 hours. Once you receive a response from
            us, a 50% nonrefundable deposit will be required via Venmo to secure
            your order. We will hold your spot for 48 hours. Once we confirm
            that your deposit has been received, your order will then be
            confirmed.
          </p>
          <p>Final payment is due one week prior to pickup date.</p>
          <p>
            <strong>PICKUP</strong> - All orders are pickup only. The pickup
            location is at a public place in Midtown. Exact location will be
            shared in confirmation email. There is a 15 minute grace period.
            Contact us if there are any issues with arriving on time for your
            pickup. If you do not arrive within the grace period, we will
            attempt to contact you twice via the phone number provided. If no
            contact is made, we have the discretion to leave and your order is
            void. 50% of total payment will be refunded.
          </p>
        </div>
      </div>

      <div className={styles.termsCheckbox}>
        <label>
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => onUpdate({ termsAccepted: e.target.checked })}
          />
          <span>I have read and agreed to these terms and conditions.</span>
        </label>
      </div>
    </div>
  );
};
