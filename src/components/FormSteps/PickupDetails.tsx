import type { ChangeEvent } from "react";
import styles from "./FormSteps.module.css";
import type { FormData } from "../../pages/DesignPackagePage";

interface FormStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const TIME_SLOTS: Record<string, string[]> = {
  Monday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Tuesday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Wednesday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Thursday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Friday: ["8:00 AM - 9:00 AM", "5:00 PM - 8:00 PM"],
  Saturday: ["9:00 AM - 12:00 PM"],
  Sunday: ["3:00 PM - 7:00 PM"],
};

function getDayOfWeek(dateStr: string): keyof typeof TIME_SLOTS | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getUTCDay(); // 0 Sun .. 6 Sat (UTC to avoid TZ flakiness)
  const map: Array<keyof typeof TIME_SLOTS> = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return map[day];
}

export const PickupDetails = ({
  formData,
  updateFormData,
  onPrev,
  onSubmit,
}: FormStepProps) => {
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateFormData({ pickupDate: e.target.value, pickupTime: "" });
  };
  const handleTimeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateFormData({ pickupTime: e.target.value });
  };

  const dayOfWeek = getDayOfWeek(formData.pickupDate);
  const available = dayOfWeek ? TIME_SLOTS[dayOfWeek] : [];
  const isValid = Boolean(formData.pickupDate) && Boolean(formData.pickupTime);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.questionSection}>
        <h3 className={styles.questionTitle}>Pickup date and time</h3>
        <p className={styles.questionDescription}>
          Choose a date and one of the available pickup windows.
        </p>
      </div>

      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="pickupDate" className={styles.label}>
            Date *
          </label>
          <input
            id="pickupDate"
            type="date"
            value={formData.pickupDate}
            onChange={handleDateChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="pickupTime" className={styles.label}>
            Time Window *
          </label>
          <select
            id="pickupTime"
            className={styles.input}
            value={formData.pickupTime}
            onChange={handleTimeChange}
            disabled={!dayOfWeek}
            required
          >
            <option value="" disabled>
              {dayOfWeek ? "Select a time" : "Select a date first"}
            </option>
            {available.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={onPrev}
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid}
          className={`${styles.button} ${styles.primaryButton} ${
            !isValid ? styles.disabled : ""
          }`}
        >
          Submit Order
        </button>
      </div>
    </div>
  );
};
