import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContactInformation } from "./ContactInformation";
import type { FormData } from '@sweetly-dipped/shared-types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

const mockOnUpdate = vi.fn();

describe("ContactInformation", () => {
  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it("renders contact information correctly", () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Contact Information")).toBeInTheDocument();
    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("Phone:")).toBeInTheDocument();
    expect(screen.getByText("Preferred Contact Method:")).toBeInTheDocument();
  });

  it("displays contact values correctly", () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("123-456-7890")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("displays text message for text communication method", () => {
    const textData = { ...mockFormData, communicationMethod: "text" as const };
    render(<ContactInformation formData={textData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Text Message")).toBeInTheDocument();
  });

  it("displays not specified for empty communication method", () => {
    const emptyData = { ...mockFormData, communicationMethod: "" as const };
    render(<ContactInformation formData={emptyData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  it("allows editing name field", async () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]); // Name edit button

    const nameInput = screen.getByDisplayValue("John Doe");
    expect(nameInput).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: "Jane Smith" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        firstName: "Jane",
        lastName: "Smith",
      });
    });
  });

  it("allows editing email field", async () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[1]); // Email edit button

    const emailInput = screen.getByDisplayValue("john.doe@example.com");
    expect(emailInput).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: "jane.smith@example.com" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        email: "jane.smith@example.com",
      });
    });
  });

  it("allows editing phone field", async () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[2]); // Phone edit button

    const phoneInput = screen.getByDisplayValue("123-456-7890");
    expect(phoneInput).toBeInTheDocument();

    fireEvent.change(phoneInput, { target: { value: "987-654-3210" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        phone: "987-654-3210",
      });
    });
  });

  it("handles name field with only first name", async () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]); // Name edit button

    const nameInput = screen.getByDisplayValue("John Doe");
    fireEvent.change(nameInput, { target: { value: "Jane" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        firstName: "Jane",
        lastName: "",
      });
    });
  });

  it("handles empty name field", async () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]); // Name edit button

    const nameInput = screen.getByDisplayValue("John Doe");
    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        firstName: "",
        lastName: "",
      });
    });
  });

  it("cancels editing when cancel button is clicked", () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]); // Name edit button

    const nameInput = screen.getByDisplayValue("John Doe");
    fireEvent.change(nameInput, { target: { value: "Jane Smith" } });
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Jane Smith")).not.toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it("uses correct input types for different fields", () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByText("Edit");
    
    // Name field
    fireEvent.click(editButtons[0]);
    expect(screen.getByDisplayValue("John Doe")).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByText("Cancel"));

    // Email field
    fireEvent.click(editButtons[1]);
    expect(screen.getByDisplayValue("john.doe@example.com")).toHaveAttribute("type", "email");
    fireEvent.click(screen.getByText("Cancel"));

    // Phone field
    fireEvent.click(editButtons[2]);
    expect(screen.getByDisplayValue("123-456-7890")).toHaveAttribute("type", "tel");
  });

  it("handles multiple consecutive edits", async () => {
    render(<ContactInformation formData={mockFormData} onUpdate={mockOnUpdate} />);

    // Edit name
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);
    fireEvent.change(screen.getByDisplayValue("John Doe"), { target: { value: "Jane Smith" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        firstName: "Jane",
        lastName: "Smith",
      });
    });

    // Edit email
    fireEvent.click(screen.getAllByText("Edit")[1]);
    fireEvent.change(screen.getByDisplayValue("john.doe@example.com"), { target: { value: "jane@example.com" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        email: "jane@example.com",
      });
    });
  });
});
