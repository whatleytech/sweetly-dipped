import type { ChangeEvent } from "react";
import styles from "./FormSteps.module.css";
import type { FormData, FormStepProps, DayOfWeek } from "@/types/formTypes";
import { FormButtons, FormStepContainer } from "@/components/shared";
import { useTimeSlots, useUnavailablePeriods } from "@/hooks/useConfigQuery";
import {
  generateTimeIntervals,
  timeSlotToWindow,
  getUnavailablePeriod,
  formatDateForDisplay,
  isRushOrder,
} from "@/utils/timeUtils";
import { kebabCase } from 'lodash';

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
}: FormStepProps & { updateFormData: (updates: Partial<FormData>) => void }) => {
  const { data: timeSlots, isLoading: isLoadingTimeSlots, isError: isErrorTimeSlots, error: timeSlotsError, refetch: refetchTimeSlots } = useTimeSlots();
  const { data: unavailablePeriods = [], isLoading: isLoadingPeriods, isError: isErrorPeriods, error: periodsError, refetch: refetchPeriods } = useUnavailablePeriods();

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const isRush = isRushOrder(newDate);

    updateFormData({
      pickupDate: newDate,
      pickupTime: "",
      rushOrder: isRush,
    });
  };

  const handleTimeSlotClick = (time: string) => {
    updateFormData({ pickupTime: time });
  };

  const dayOfWeek = getDayOfWeek(formData.pickupDate);
  const availableTimeSlots = dayOfWeek && timeSlots ? (timeSlots[dayOfWeek] || []) : [];

  // Check if the selected date is today or in the past
  const isPastOrTodayDate =
    formData.pickupDate &&
    new Date(formData.pickupDate) <= new Date(new Date().toDateString());

  // Check if the selected date falls within an unavailable period
  const unavailablePeriod = getUnavailablePeriod(
    formData.pickupDate,
    unavailablePeriods
  );

  // Check if the selected date is a rush order (within 2 weeks)
  const isRushOrderDate = isRushOrder(formData.pickupDate);

  // Generate time slots grouped by window for better visual organization
  const timeSlotsByWindow = availableTimeSlots.map((timeSlot) => ({
    timeSlot,
    windowLabel: timeSlotToWindow(timeSlot),
    slots: generateTimeIntervals(timeSlotToWindow(timeSlot)),
  }));

  const isValid =
    Boolean(formData.pickupDate) &&
    Boolean(formData.pickupTime) &&
    !isPastOrTodayDate &&
    !unavailablePeriod;

  if (isLoadingTimeSlots || isLoadingPeriods) {
    return (
      <FormStepContainer
        title="Pickup date and time"
        description="Loading pickup options..."
      >
        <div>Loading...</div>
      </FormStepContainer>
    );
  }

  if (isErrorTimeSlots || isErrorPeriods) {
    return (
      <FormStepContainer
        title="Pickup date and time"
        description="Error loading pickup options"
      >
        <div>
          <p>Failed to load pickup options: {timeSlotsError?.message || periodsError?.message}</p>
          <button type="button" onClick={() => { refetchTimeSlots(); refetchPeriods(); }}>
            Retry
          </button>
        </div>
      </FormStepContainer>
    );
  }

  return (
    <FormStepContainer
      title="Pickup date and time"
      description="Choose a date and select your preferred pickup time from the available slots."
    >
      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="pickup-date" className={styles.label}>
            Date *
          </label>
          <input
            id="pickup-date"
            type="date"
            value={formData.pickupDate}
            onChange={handleDateChange}
            className={styles.input}
            min={
              new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
            }
            required
          />
        </div>

        {formData.pickupDate && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Available Pickup Times *</label>
            {isPastOrTodayDate ? (
              <div className={styles.errorMessage} role="alert">
                Please select a date in the future. Same-day pickup is not
                available.
              </div>
            ) : unavailablePeriod ? (
              <div className={styles.errorMessage} role="alert">
                {unavailablePeriod.endDate ? (
                  <>
                    I am unavailable for pickup between{' '}
                    {formatDateForDisplay(unavailablePeriod.startDate)} -{' '}
                    {formatDateForDisplay(unavailablePeriod.endDate)}. Sorry for
                    the inconvenience. Please select another date.
                  </>
                ) : (
                  <>
                    I am unavailable for pickup on{' '}
                    {formatDateForDisplay(unavailablePeriod.startDate)}. Sorry
                    for the inconvenience. Please select another date.
                  </>
                )}
              </div>
            ) : isRushOrderDate ? (
              <div className={styles.infoMessage} role="alert">
                <strong>Rush Order Notice:</strong> Your selected pickup date is
                within 2 weeks. We will reach out to confirm if we are able to
                fulfill your order in this timeframe. Please proceed with your
                time selection.
              </div>
            ) : null}

            {formData.pickupDate &&
              !isPastOrTodayDate &&
              !unavailablePeriod && (
                <>
                  {timeSlotsByWindow.length > 0 ? (
                    <div className={styles.timeWindows}>
                      {timeSlotsByWindow.map(({ windowLabel, slots }) => (
                        <div key={windowLabel} className={styles.timeWindow}>
                          <h4 className={styles.timeWindowLabel}>
                            {windowLabel}
                          </h4>
                          <div className={styles.timeGrid}>
                            {slots.map((time) => (
                              <button
                                key={time}
                                id={kebabCase(time)}
                                type="button"
                                className={`${styles.timeSlot} ${
                                  formData.pickupTime === time
                                    ? styles.timeSlotSelected
                                    : ''
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
                </>
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
