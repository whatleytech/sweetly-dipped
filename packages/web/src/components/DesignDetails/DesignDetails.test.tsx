import { render, screen } from "@testing-library/react";
import { DesignDetails } from "./DesignDetails";
import type { FormData } from '@sweetly-dipped/shared-types';
import { describe, it, expect } from "vitest";

const mockFormData: FormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  communicationMethod: 'email',
  packageType: 'medium',
  riceKrispies: 0,
  oreos: 0,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: 'Pink and Gold',
  eventType: 'Birthday',
  theme: 'Princess',
  additionalDesigns: 'Add some sparkles',
  pickupDate: '2024-02-15',
  pickupTime: '8:30 AM',
  rushOrder: false,
  referralSource: '',
  termsAccepted: false,
  visitedSteps: new Set(),
};

describe("DesignDetails", () => {
  it("renders design details section correctly", () => {
    render(<DesignDetails formData={mockFormData} />);

    expect(screen.getByText("Design Details")).toBeInTheDocument();
    expect(screen.getByText("Color Scheme:")).toBeInTheDocument();
    expect(screen.getByText("Event Type:")).toBeInTheDocument();
    expect(screen.getByText("Theme:")).toBeInTheDocument();
  });

  it("displays design values correctly", () => {
    render(<DesignDetails formData={mockFormData} />);

    expect(screen.getByText("Pink and Gold")).toBeInTheDocument();
    expect(screen.getByText("Birthday")).toBeInTheDocument();
    expect(screen.getByText("Princess")).toBeInTheDocument();
    expect(screen.getByText("Add some sparkles")).toBeInTheDocument();
  });

  it("displays additional design notes when present", () => {
    render(<DesignDetails formData={mockFormData} />);

    expect(screen.getByText("Additional Design Notes:")).toBeInTheDocument();
    expect(screen.getByText("Add some sparkles")).toBeInTheDocument();
  });

  it("does not display additional design notes when empty", () => {
    const emptyDesignsData = { ...mockFormData, additionalDesigns: "" };
    render(<DesignDetails formData={emptyDesignsData} />);

    expect(screen.queryByText("Additional Design Notes:")).not.toBeInTheDocument();
  });

  it("displays not specified for empty color scheme", () => {
    const emptyColorData = { ...mockFormData, colorScheme: "" };
    render(<DesignDetails formData={emptyColorData} />);

    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  it("displays not specified for empty event type", () => {
    const emptyEventData = { ...mockFormData, eventType: "" };
    render(<DesignDetails formData={emptyEventData} />);

    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  it("displays not specified for empty theme", () => {
    const emptyThemeData = { ...mockFormData, theme: "" };
    render(<DesignDetails formData={emptyThemeData} />);

    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  it("handles all empty design fields", () => {
    const emptyData = {
      ...mockFormData,
      colorScheme: "",
      eventType: "",
      theme: "",
      additionalDesigns: "",
    };
    render(<DesignDetails formData={emptyData} />);

    const notSpecifiedElements = screen.getAllByText("Not specified");
    expect(notSpecifiedElements).toHaveLength(3);
    expect(screen.queryByText("Additional Design Notes:")).not.toBeInTheDocument();
  });

  it("handles long design text values", () => {
    const longTextData = {
      ...mockFormData,
      colorScheme: "A very long color scheme description that might wrap to multiple lines",
      eventType: "A very long event type description that might wrap to multiple lines",
      theme: "A very long theme description that might wrap to multiple lines",
      additionalDesigns: "A very long additional design notes description that might wrap to multiple lines",
    };
    render(<DesignDetails formData={longTextData} />);

    expect(screen.getByText("A very long color scheme description that might wrap to multiple lines")).toBeInTheDocument();
    expect(screen.getByText("A very long event type description that might wrap to multiple lines")).toBeInTheDocument();
    expect(screen.getByText("A very long theme description that might wrap to multiple lines")).toBeInTheDocument();
    expect(screen.getByText("A very long additional design notes description that might wrap to multiple lines")).toBeInTheDocument();
  });
});
