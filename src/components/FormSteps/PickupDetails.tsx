import type { ChangeEvent } from "react";
import styles from "./FormSteps.module.css";
import type { FormStepProps, DayOfWeek } from "../../types/formTypes";
import { FormButtons, FormStepContainer } from "../shared";
import { TIME_SLOTS } from "../../constants/formData";
import { generateTimeIntervals, timeSlotToWindow } from "../../utils/timeUtils";

function getDayOfWeek(dateStr: string): DayOfWeek | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;

  const dayName = d.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC", // Use UTC to avoid timezone issues
  }) as DayOfWeek;

  return dayName;
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
  const availableTimeSlots = dayOfWeek ? TIME_SLOTS[dayOfWeek] : [];

  // Generate time slots grouped by window for better visual organization
  const timeSlotsByWindow = availableTimeSlots.map((timeSlot) => ({
    timeSlot,
    windowLabel: timeSlotToWindow(timeSlot),
    slots: generateTimeIntervals(timeSlotToWindow(timeSlot)),
  }));

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
            {timeSlotsByWindow.length > 0 ? (
              <div className={styles.timeWindows}>
                {timeSlotsByWindow.map(({ windowLabel, slots }) => (
                  <div key={windowLabel} className={styles.timeWindow}>
                    <h4 className={styles.timeWindowLabel}>{windowLabel}</h4>
                    <div className={styles.timeGrid}>
                      {slots.map((time) => (
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
                  </div>
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
