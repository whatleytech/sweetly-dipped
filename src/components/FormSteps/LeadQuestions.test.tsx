import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LeadQuestions } from "./LeadQuestions";
import type { FormData } from "../../types/formTypes";


const mockFormData: FormData = {
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

describe("LeadQuestions", () => {
  const mockUpdateFormData = vi.fn();
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the question title and description", () => {
    render(
      <LeadQuestions
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    expect(
      screen.getByText("Let's start with your contact information")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "We'll use this information to confirm your order and keep you updated on your treats!"
      )
    ).toBeInTheDocument();
  });

  it("renders all required form fields", () => {
    render(
      <LeadQuestions
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    expect(screen.getByLabelText("First Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address *")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number *")).toBeInTheDocument();
  });

  it("calls updateFormData when input fields change", () => {
    render(
      <LeadQuestions
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const firstNameInput = screen.getByLabelText("First Name *");
    fireEvent.change(firstNameInput, { target: { value: "John" } });

    expect(mockUpdateFormData).toHaveBeenCalledWith({ firstName: "John" });
  });

  it("disables continue button when form is invalid", () => {
    render(
      <LeadQuestions
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it("enables continue button when all fields are filled", () => {
    const filledFormData = {
      ...mockFormData,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
    };

    render(
      <LeadQuestions
        formData={filledFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).not.toBeDisabled();
  });

  it("keeps continue disabled for invalid email", () => {
    const invalidEmailData = {
      ...mockFormData,
      firstName: "John",
      lastName: "Doe",
      email: "john@invalid", // missing TLD
      phone: "123-456-7890",
    };

    render(
      <LeadQuestions
        formData={invalidEmailData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it("keeps continue disabled for invalid phone format", () => {
    const invalidPhoneData = {
      ...mockFormData,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "1234567890", // missing dashes
    };

    render(
      <LeadQuestions
        formData={invalidPhoneData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it("calls onNext when continue button is clicked with valid form", () => {
    const filledFormData = {
      ...mockFormData,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
    };

    render(
      <LeadQuestions
        formData={filledFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it("does not call onNext when continue button is clicked with invalid form", () => {
    render(
      <LeadQuestions
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueButton);

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it("displays existing form data in input fields", () => {
    const filledFormData = {
      ...mockFormData,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "987-654-3210",
    };

    render(
      <LeadQuestions
        formData={filledFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Smith")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("987-654-3210")).toBeInTheDocument();
  });

  it("validates that all fields are required", () => {
    const partiallyFilledData = {
      ...mockFormData,
      firstName: "John",
      lastName: "Doe",
      // Missing email and phone
    };

    render(
      <LeadQuestions
        formData={partiallyFilledData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it("formats phone as the user types and strips non-digits", () => {
    render(
      <LeadQuestions
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const phoneInput = screen.getByLabelText(
      "Phone Number *"
    ) as HTMLInputElement;

    // Type a messy string with letters and symbols
    fireEvent.change(phoneInput, { target: { value: "1a2b3-4c5d6e7f8g9h0" } });
    // Expect formatted to 123-456-7890
    expect(mockUpdateFormData).toHaveBeenLastCalledWith({
      phone: "123-456-7890",
    });

    // Type partial digits to ensure partial formatting works
    mockUpdateFormData.mockClear();
    fireEvent.change(phoneInput, { target: { value: "12" } });
    expect(mockUpdateFormData).toHaveBeenLastCalledWith({ phone: "12" });

    mockUpdateFormData.mockClear();
    fireEvent.change(phoneInput, { target: { value: "1234" } });
    expect(mockUpdateFormData).toHaveBeenLastCalledWith({ phone: "123-4" });

    mockUpdateFormData.mockClear();
    fireEvent.change(phoneInput, { target: { value: "1234567" } });
    expect(mockUpdateFormData).toHaveBeenLastCalledWith({ phone: "123-456-7" });
  });
});
