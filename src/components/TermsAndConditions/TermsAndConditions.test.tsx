import { render, screen, fireEvent } from "@testing-library/react";
import { TermsAndConditions } from "./TermsAndConditions";
import type { FormData } from '@/types/formTypes';
import { describe, it, expect, vi, beforeEach } from "vitest";

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
  termsAccepted: true,
};

const mockOnUpdate = vi.fn();

describe("TermsAndConditions", () => {
  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it("renders terms and conditions section correctly", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Important Information")).toBeInTheDocument();
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
  });

  it("displays information box content correctly", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    expect(
      screen.getByText(/After you complete this order form/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Completion of this form does NOT mean/)).toBeInTheDocument();
    expect(screen.getByText(/You should hear from us within 48 hours/)).toBeInTheDocument();
    expect(screen.getByText(/If you have any questions or concerns/)).toBeInTheDocument();
  });

  it("displays contact email link correctly", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    const emailLink = screen.getByText("sweetlydippedbyjas@gmail.com");
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", "mailto:sweetlydippedbyjas@gmail.com");
  });

  it("displays terms and conditions content correctly", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/Completing this form does NOT confirm your order/)).toBeInTheDocument();
    expect(screen.getByText(/You will receive a response via EMAIL within 48 hours/)).toBeInTheDocument();
    expect(screen.getByText(/a 50% nonrefundable deposit will be required/)).toBeInTheDocument();
    expect(screen.getByText(/We will hold your spot for 48 hours/)).toBeInTheDocument();
    expect(screen.getByText(/Final payment is due one week prior to pickup date/)).toBeInTheDocument();
  });

  it("displays pickup terms correctly", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/PICKUP/)).toBeInTheDocument();
    expect(screen.getByText(/All orders are pickup only/)).toBeInTheDocument();
    expect(screen.getByText(/The pickup location is at a public place in Midtown/)).toBeInTheDocument();
    expect(screen.getByText(/There is a 15 minute grace period/)).toBeInTheDocument();
    expect(screen.getByText(/If you do not arrive within the grace period/)).toBeInTheDocument();
    expect(screen.getByText(/50% of total payment will be refunded/)).toBeInTheDocument();
  });

  it("displays terms acceptance checkbox correctly", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(screen.getByText("I have read and agreed to these terms and conditions.")).toBeInTheDocument();
  });

  it("displays unchecked checkbox when terms not accepted", () => {
    const uncheckedData = { ...mockFormData, termsAccepted: false };
    render(<TermsAndConditions formData={uncheckedData} onUpdate={mockOnUpdate} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("calls onUpdate when checkbox is checked", () => {
    const uncheckedData = { ...mockFormData, termsAccepted: false };
    render(<TermsAndConditions formData={uncheckedData} onUpdate={mockOnUpdate} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({ termsAccepted: true });
  });

  it("calls onUpdate when checkbox is unchecked", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({ termsAccepted: false });
  });

  it("handles multiple checkbox toggles", () => {
    const uncheckedData = { ...mockFormData, termsAccepted: false };
    render(<TermsAndConditions formData={uncheckedData} onUpdate={mockOnUpdate} />);

    const checkbox = screen.getByRole("checkbox");
    
    // Check
    fireEvent.click(checkbox);
    expect(mockOnUpdate).toHaveBeenCalledWith({ termsAccepted: true });
    
    // Reset mock for next call
    mockOnUpdate.mockClear();
    
    // Check again (should uncheck since it was already checked)
    fireEvent.click(checkbox);
    expect(mockOnUpdate).toHaveBeenCalledWith({ termsAccepted: true });
    
    // Reset mock for next call
    mockOnUpdate.mockClear();
    
    // Check again
    fireEvent.click(checkbox);
    expect(mockOnUpdate).toHaveBeenCalledWith({ termsAccepted: true });
  });

  it("has correct checkbox attributes", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("has correct label structure", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    const label = screen.getByText("I have read and agreed to these terms and conditions.");
    expect(label).toBeInTheDocument();
    
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("displays all required legal text", () => {
    render(<TermsAndConditions formData={mockFormData} onUpdate={mockOnUpdate} />);

    // Check for key legal phrases
    expect(screen.getByText(/nonrefundable deposit/)).toBeInTheDocument();
    expect(screen.getByText(/grace period/)).toBeInTheDocument();
    expect(screen.getByText(/order is void/)).toBeInTheDocument();
    expect(screen.getByText(/will be refunded/)).toBeInTheDocument();
  });
});
