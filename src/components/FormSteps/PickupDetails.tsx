import type { ChangeEvent } from "react";
import styles from "./FormSteps.module.css";
import type { FormStepProps } from "../../types/formTypes";
import { FormButtons, FormStepContainer } from "../shared";
import { TIME_SLOTS, DAY_MAP } from "../../constants/formData";

function getDayOfWeek(dateStr: string): keyof typeof TIME_SLOTS | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getUTCDay(); // 0 Sun .. 6 Sat (UTC to avoid TZ flakiness)
  return DAY_MAP[day];
}

export const PickupDetails = ({
  formData,
  updateFormData,
  onPrev,
  onSubmit,
  isFirstStep,
  isLastStep,
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
    <FormStepContainer
      title="Pickup date and time"
      description="Choose a date and one of the available pickup windows."
    >
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

      <FormButtons
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isValid={isValid}
        submitLabel="Submit Order"
      />
    </FormStepContainer>
  );
};
