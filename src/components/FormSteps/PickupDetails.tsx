import type { ChangeEvent } from "react";
import styles from "./FormSteps.module.css";
import type { FormStepProps } from "../../types/formTypes";
import { FormButtons, FormStepContainer } from "../shared";
import { TIME_SLOTS, DAY_MAP } from "../../constants/formData";
import { generateTimeIntervals } from "../../utils/timeUtils";

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
    updateFormData({
      pickupDate: e.target.value,
      pickupTimeWindow: "",
      pickupTime: "",
    });
  };

  const handleTimeSlotClick = (time: string) => {
    updateFormData({ pickupTime: time });
  };

  const dayOfWeek = getDayOfWeek(formData.pickupDate);
  const availableWindows = dayOfWeek ? TIME_SLOTS[dayOfWeek] : [];

  // Generate all available time slots for the selected date
  const availableTimeSlots = availableWindows.flatMap((window) =>
    generateTimeIntervals(window)
  );

  const isValid = Boolean(formData.pickupDate) && Boolean(formData.pickupTime);

  return (
    <FormStepContainer
      title="Pickup date and time"
      description="Choose a date and select your preferred pickup time from the available slots."
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

        {formData.pickupDate && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Available Pickup Times *</label>
            {availableTimeSlots.length > 0 ? (
              <div className={styles.timeGrid}>
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`${styles.timeSlot} ${
                      formData.pickupTime === time
                        ? styles.timeSlotSelected
                        : ""
                    }`}
                    onClick={() => handleTimeSlotClick(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.noTimesMessage}>
                No pickup times available for this date. Please select a
                different date.
              </p>
            )}
          </div>
        )}
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
