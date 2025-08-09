 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PickupDetails } from './PickupDetails';
import type { FormData } from "../../types/formTypes";


const baseData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  communicationMethod: "",
  packageType: "",
  riceKrispies: 0,
  oreos: 0,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: "",
  eventType: "",
  theme: "",
  additionalDesigns: "",
  pickupDate: "",
  pickupTimeWindow: "",
  pickupTime: "",
  rushOrder: false,
};

// Helper functions for test dates
const getFutureDate = (daysFromNow: number = 7): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

const getFutureFriday = (): string => {
  const date = new Date();
  // Find next Friday (5 = Friday)
  const daysUntilFriday = (5 - date.getDay() + 7) % 7;
  const nextFriday = daysUntilFriday === 0 ? 7 : daysUntilFriday; // If today is Friday, get next Friday
  date.setDate(date.getDate() + nextFriday);
  return date.toISOString().split("T")[0];
};

const getPastDate = (daysAgo: number = 1): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

describe("PickupDetails", () => {
  const updateFormData = vi.fn();
  const onSubmit = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders date input and time grid when date is selected", () => {
    const { rerender } = render(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    expect(screen.getByLabelText("Date *")).toBeInTheDocument();
    expect(
      screen.queryByText("Available Pickup Times *")
    ).not.toBeInTheDocument();

    // Time grid should appear after selecting a date
    rerender(
      <PickupDetails
        formData={{ ...baseData, pickupDate: getFutureDate() }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    expect(screen.getByText("Available Pickup Times *")).toBeInTheDocument();
  });

  it("shows time grid when date is selected", () => {
    render(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Choose a future date
    const dateInput = screen.getByLabelText("Date *");
    fireEvent.change(dateInput, { target: { value: getFutureDate() } });

    expect(updateFormData).toHaveBeenCalledWith({
      pickupDate: getFutureDate(),
      pickupTimeWindow: "",
      pickupTime: "",
      rushOrder: true, // getFutureDate(7) falls within 2 weeks
    });
  });

  it("enables submit only when date and time are selected", () => {
    const data = { ...baseData, pickupDate: getFutureDate(), pickupTime: "" };
    const { rerender } = render(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /submit order/i });
    expect(submitBtn).toBeDisabled();

    // Enabled with time selected
    rerender(
      <PickupDetails
        formData={{ ...data, pickupTime: "5:15 PM" }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    expect(
      screen.getByRole("button", { name: /submit order/i })
    ).not.toBeDisabled();
  });

  it("calls onPrev and onSubmit appropriately", () => {
    render(
      <PickupDetails
        formData={{
          ...baseData,
          pickupDate: getFutureDate(),
          pickupTimeWindow: "5:00 PM - 8:00 PM",
          pickupTime: "5:15 PM",
        }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onPrev).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /submit order/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows time slots grouped by windows when date is selected", () => {
    const data = {
      ...baseData,
      pickupDate: getFutureFriday(), // Friday
    };

    render(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Should show window labels for Friday
    expect(screen.getByText("8:00 AM - 9:00 AM")).toBeInTheDocument();
    expect(screen.getByText("5:00 PM - 8:00 PM")).toBeInTheDocument();

    // Should show time slots for each window
    expect(screen.getByText("8:00 AM")).toBeInTheDocument();
    expect(screen.getByText("8:15 AM")).toBeInTheDocument();
    expect(screen.getByText("8:30 AM")).toBeInTheDocument();
    expect(screen.getByText("8:45 AM")).toBeInTheDocument();
    expect(screen.getByText("9:00 AM")).toBeInTheDocument();
    expect(screen.getByText("5:00 PM")).toBeInTheDocument();
    expect(screen.getByText("5:15 PM")).toBeInTheDocument();
    // ... and all other times from both Friday windows
  });

  it("handles time slot selection", () => {
    const data = {
      ...baseData,
      pickupDate: getFutureFriday(), // Friday
    };

    render(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    const timeButton = screen.getByText("8:15 AM");
    fireEvent.click(timeButton);

    expect(updateFormData).toHaveBeenCalledWith({ pickupTime: "8:15 AM" });
  });

  it("shows error message when today's date is entered", () => {
    render(
      <PickupDetails
        formData={{ ...baseData, pickupDate: getTodayDate() }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Should show error message
    expect(
      screen.getByText(
        "Please select a date in the future. Same-day pickup is not available."
      )
    ).toBeInTheDocument();

    // Should not show time slots
    expect(screen.queryByText("8:00 AM - 9:00 AM")).not.toBeInTheDocument();

    // Submit button should be disabled
    expect(
      screen.getByRole("button", { name: /submit order/i })
    ).toBeDisabled();
  });

  it("shows error message when past date is manually entered", () => {
    render(
      <PickupDetails
        formData={{ ...baseData, pickupDate: getPastDate() }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Should show error message
    expect(
      screen.getByText(
        "Please select a date in the future. Same-day pickup is not available."
      )
    ).toBeInTheDocument();

    // Should not show time slots
    expect(screen.queryByText("8:00 AM - 9:00 AM")).not.toBeInTheDocument();

    // Submit button should be disabled
    expect(
      screen.getByRole("button", { name: /submit order/i })
    ).toBeDisabled();
  });

  it("prevents selecting today or past dates by setting min attribute to tomorrow", () => {
    render(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    expect(dateInput).toHaveAttribute("min", tomorrow);
    expect(dateInput.type).toBe("date");
  });

  it("shows unavailable date error message for dates in unavailable period", () => {
    render(
      <PickupDetails
        formData={{ ...baseData, pickupDate: "2025-08-30" }} // Within vacation period
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Should show unavailable date error message
    expect(
      screen.getByText(
        "I am unavailable for pickup between Aug 28 - Sep 3. Sorry for the inconvenience. Please select another date."
      )
    ).toBeInTheDocument();

    // Should not show time slots
    expect(screen.queryByText("8:00 AM - 9:00 AM")).not.toBeInTheDocument();

    // Submit button should be disabled
    expect(
      screen.getByRole("button", { name: /submit order/i })
    ).toBeDisabled();
  });

  it("shows unavailable date error message for dates in second unavailable period", () => {
    render(
      <PickupDetails
        formData={{ ...baseData, pickupDate: "2025-10-11" }} // Within business trip period
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Should show unavailable date error message
    expect(
      screen.getByText(
        "I am unavailable for pickup between Oct 9 - Oct 13. Sorry for the inconvenience. Please select another date."
      )
    ).toBeInTheDocument();

    // Should not show time slots
    expect(screen.queryByText("8:00 AM - 9:00 AM")).not.toBeInTheDocument();

    // Submit button should be disabled
    expect(
      screen.getByRole("button", { name: /submit order/i })
    ).toBeDisabled();
  });

  it("shows time slots normally for available dates", () => {
    render(
      <PickupDetails
        formData={{ ...baseData, pickupDate: getFutureFriday() }} // Available date
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Should not show any error messages
    expect(
      screen.queryByText(/I am unavailable for pickup/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Same-day pickup is not available/)
    ).not.toBeInTheDocument();

    // Should show time slots
    expect(screen.getByText("8:00 AM - 9:00 AM")).toBeInTheDocument();
  });

  it("shows single-day unavailable error message correctly", () => {
    render(
      <PickupDetails
        formData={{ ...baseData, pickupDate: "2025-11-15" }} // Single-day unavailability
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Should show single-day unavailable error message
    expect(
      screen.getByText(
        "I am unavailable for pickup on Nov 15. Sorry for the inconvenience. Please select another date."
      )
    ).toBeInTheDocument();

    // Should not show time slots
    expect(screen.queryByText("8:00 AM - 9:00 AM")).not.toBeInTheDocument();

    // Submit button should be disabled
    expect(
      screen.getByRole("button", { name: /submit order/i })
    ).toBeDisabled();
  });

  it("shows rush order message for dates within 2 weeks", () => {
    // Get tomorrow's date (within 2 weeks)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    render(
      <PickupDetails
        formData={{ ...baseData, pickupDate: tomorrowDate, rushOrder: true }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Should show rush order message
    expect(screen.getByText(/Rush Order Notice/)).toBeInTheDocument();
    expect(
      screen.getByText(/Your selected pickup date is within 2 weeks/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We will reach out to confirm/)
    ).toBeInTheDocument();

    // Should still show time slots for rush orders (Sunday has 3:00 PM - 7:00 PM)
    expect(screen.getByText("3:00 PM - 7:00 PM")).toBeInTheDocument();
  });

  it("does not show rush order message for dates beyond 2 weeks", () => {
    render(
      <PickupDetails
        formData={{
          ...baseData,
          pickupDate: getFutureDate(60), // Far enough to avoid unavailable periods
          rushOrder: false,
        }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Should not show rush order message
    expect(screen.queryByText(/Rush Order Notice/)).not.toBeInTheDocument();

    // Should show time slots normally (date will depend on what day getFutureDate(20) lands on)
    // Check for time slots in general rather than specific window
    expect(screen.getByText(/Available Pickup Times/)).toBeInTheDocument();
  });

  it("updates rushOrder property when date changes to within 2 weeks", () => {
    render(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Select a date within 2 weeks
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 5);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    const dateInput = screen.getByLabelText("Date *");
    fireEvent.change(dateInput, { target: { value: tomorrowDate } });

    expect(updateFormData).toHaveBeenCalledWith({
      pickupDate: tomorrowDate,
      pickupTimeWindow: "",
      pickupTime: "",
      rushOrder: true,
    });
  });

  it("updates rushOrder property when date changes to beyond 2 weeks", () => {
    render(
      <PickupDetails
        formData={{ ...baseData, rushOrder: true }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Select a date beyond 2 weeks
    const futureDate = getFutureDate(60); // Far enough to avoid unavailable periods

    const dateInput = screen.getByLabelText("Date *");
    fireEvent.change(dateInput, { target: { value: futureDate } });

    expect(updateFormData).toHaveBeenCalledWith({
      pickupDate: futureDate,
      pickupTimeWindow: "",
      pickupTime: "",
      rushOrder: false,
    });
  });
});
