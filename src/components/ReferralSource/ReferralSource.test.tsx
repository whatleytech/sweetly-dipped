import { render, screen, fireEvent } from "@testing-library/react";
import { ReferralSource } from "./ReferralSource";
import type { FormData } from "../../types/formTypes";
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
  referralSource: "Instagram",
  termsAccepted: false,
};

const mockOnUpdate = vi.fn();

describe("ReferralSource", () => {
  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it("renders referral source section correctly", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("How did you hear about us?*")).toBeInTheDocument();
    expect(screen.getByText("Referral Source:")).toBeInTheDocument();
  });

  it("displays all referral options in dropdown", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox");
    fireEvent.click(select);

    expect(screen.getByText("Select an option...")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("Tiktok")).toBeInTheDocument();
    expect(screen.getByText("Returning customer")).toBeInTheDocument();
    expect(screen.getByText("Referral")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("displays selected referral source correctly", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("Instagram");
  });

  it("displays empty selection when no referral source is set", () => {
    const emptyData = { ...mockFormData, referralSource: "" };
    render(<ReferralSource formData={emptyData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("");
  });

  it("calls onUpdate when selection changes", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Tiktok" } });

    expect(mockOnUpdate).toHaveBeenCalledWith({ referralSource: "Tiktok" });
  });

  it("calls onUpdate when selecting returning customer", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Returning customer" } });

    expect(mockOnUpdate).toHaveBeenCalledWith({
      referralSource: "Returning customer",
    });
  });

  it("calls onUpdate when selecting referral", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Referral" } });

    expect(mockOnUpdate).toHaveBeenCalledWith({ referralSource: "Referral" });
  });

  it("calls onUpdate when selecting other", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Other" } });

    expect(mockOnUpdate).toHaveBeenCalledWith({ referralSource: "Other" });
  });

  it("calls onUpdate when clearing selection", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "" } });

    expect(mockOnUpdate).toHaveBeenCalledWith({ referralSource: "" });
  });

  it("handles multiple selection changes", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox");

    fireEvent.change(select, { target: { value: "Tiktok" } });
    expect(mockOnUpdate).toHaveBeenCalledWith({ referralSource: "Tiktok" });

    fireEvent.change(select, { target: { value: "Returning customer" } });
    expect(mockOnUpdate).toHaveBeenCalledWith({
      referralSource: "Returning customer",
    });

    fireEvent.change(select, { target: { value: "Other" } });
    expect(mockOnUpdate).toHaveBeenCalledWith({ referralSource: "Other" });
  });

  it("has correct select attributes", () => {
    render(<ReferralSource formData={mockFormData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox");
    expect(select.className).toMatch(/referralSelect/);
  });

  it("handles unknown referral source value gracefully", () => {
    const unknownData = { ...mockFormData, referralSource: "Unknown Source" };
    render(<ReferralSource formData={unknownData} onUpdate={mockOnUpdate} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    // Unknown values should default to empty since they're not in the options
    expect(select.value).toBe("");
  });
});
