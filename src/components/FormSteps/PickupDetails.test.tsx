 
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

describe('PickupDetails', () => {
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
});
