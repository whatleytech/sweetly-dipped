 
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
        formData={{ ...baseData, pickupDate: "2025-01-10" }} // Friday
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

    // Choose a Friday date (2025-01-10 is a Friday)
    const dateInput = screen.getByLabelText("Date *");
    fireEvent.change(dateInput, { target: { value: "2025-01-10" } });

    expect(updateFormData).toHaveBeenCalledWith({
      pickupDate: "2025-01-10",
      pickupTimeWindow: "",
      pickupTime: "",
    });
  });

  it("enables submit only when date and time are selected", () => {
    const data = { ...baseData, pickupDate: "2025-01-10", pickupTime: "" };
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

  it('calls onPrev and onSubmit appropriately', () => {
    render(
      <PickupDetails
        formData={{
          ...baseData,
          pickupDate: "2025-01-10",
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

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onPrev).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows time slots grouped by windows when date is selected", () => {
    const data = {
      ...baseData,
      pickupDate: "2025-01-10", // Friday
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
      pickupDate: "2025-01-10", // Friday
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
});
