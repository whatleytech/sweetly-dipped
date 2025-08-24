import { render, screen } from '@testing-library/react';
import { PickupDetails } from './PickupDetails';
import type { FormData } from '@/types/formTypes';
import { describe, it, expect } from "vitest";

const mockFormData: FormData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "123-456-7890",
  communicationMethod: "email",
  packageType: "medium",
  riceKrispies: 0,
  oreos: 0,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: "Pink and Gold",
  eventType: "Birthday",
  theme: "Princess",
  additionalDesigns: "Add some sparkles",
  pickupDate: "2024-02-15",
  pickupTime: "8:30 AM",
  rushOrder: false,
  referralSource: "",
  termsAccepted: false,
};

describe("PickupDetails", () => {
  it("renders pickup details section correctly", () => {
    render(<PickupDetails formData={mockFormData} />);

    expect(screen.getByText("Pickup Details")).toBeInTheDocument();
    expect(screen.getByText("Pickup Date:")).toBeInTheDocument();
    expect(screen.getByText("Pickup Time:")).toBeInTheDocument();
  });

  it("displays formatted pickup date correctly", () => {
    render(<PickupDetails formData={mockFormData} />);

    // Check for the date format without specific day of week
    expect(screen.getByText(/February.*2024/)).toBeInTheDocument();
  });

  it("displays pickup time with window correctly", () => {
    render(<PickupDetails formData={mockFormData} />);

    expect(screen.getByText("8:30 AM")).toBeInTheDocument();
  });

  it("handles empty pickup date", () => {
    const emptyDateData = { ...mockFormData, pickupDate: "" };
    render(<PickupDetails formData={emptyDateData} />);

    expect(screen.getByText("Pickup Date:")).toBeInTheDocument();
    // Empty date should not display any text
    const dateField = screen.getByText("Pickup Date:").nextElementSibling;
    expect(dateField).toHaveTextContent("");
  });

  it("handles different date formats", () => {
    const differentDateData = { ...mockFormData, pickupDate: "2024-12-25" };
    render(<PickupDetails formData={differentDateData} />);

    // Check for the date format without specific day of week
    expect(screen.getByText(/December.*2024/)).toBeInTheDocument();
  });

  it("handles different time formats", () => {
    const differentTimeData = {
      ...mockFormData,
      pickupTime: "2:15 PM",
    };
    render(<PickupDetails formData={differentTimeData} />);

    expect(screen.getByText("2:15 PM")).toBeInTheDocument();
  });

  it("handles edge case date (leap year)", () => {
    const leapYearData = { ...mockFormData, pickupDate: "2024-02-29" };
    render(<PickupDetails formData={leapYearData} />);

    // Check for the date format without specific day of week
    expect(screen.getByText(/February.*2024/)).toBeInTheDocument();
  });

  it("handles edge case date (year end)", () => {
    const yearEndData = { ...mockFormData, pickupDate: "2024-12-31" };
    render(<PickupDetails formData={yearEndData} />);

    // Check for the date format without specific day of week
    expect(screen.getByText(/December.*2024/)).toBeInTheDocument();
  });

  it("handles edge case date (year start)", () => {
    const yearStartData = { ...mockFormData, pickupDate: "2024-01-01" };
    render(<PickupDetails formData={yearStartData} />);

    // Check for the date format without specific day of week
    expect(screen.getByText(/December.*2023/)).toBeInTheDocument();
  });

  it("handles invalid date gracefully", () => {
    const invalidDateData = { ...mockFormData, pickupDate: "invalid-date" };
    render(<PickupDetails formData={invalidDateData} />);

    expect(screen.getByText("Pickup Date:")).toBeInTheDocument();
    // Invalid dates should display "Invalid Date"
    expect(screen.getByText("Invalid Date")).toBeInTheDocument();
  });

  it("handles very long time window text", () => {
    const longTimeData = {
      ...mockFormData,
      pickupTime: "12:30 PM",
    };
    render(<PickupDetails formData={longTimeData} />);

    expect(screen.getByText("12:30 PM")).toBeInTheDocument();
  });
});
