import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeadQuestions } from './LeadQuestions';
import type { FormData } from '@/types/formTypes';

// Mock the shared components
vi.mock('@/components/shared', () => ({
  FormButtons: ({
    onNext,
    isValid,
  }: {
    onNext: () => void;
    isValid: boolean;
  }) => (
    <button onClick={onNext} disabled={!isValid} data-testid="next-button">
      Next
    </button>
  ),
  FormStepContainer: ({
    children,
    title,
    description,
  }: {
    children: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div data-testid="form-step-container">
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  ),
}));

describe('LeadQuestions', () => {
  const mockFormData: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    communicationMethod: '',
    packageType: '',
    riceKrispies: 0,
    oreos: 0,
    pretzels: 0,
    marshmallows: 0,
    colorScheme: '',
    eventType: '',
    theme: '',
    selectedAdditionalDesigns: [],
    pickupDate: '',
    pickupTime: '',
    rushOrder: false,
    referralSource: '',
    termsAccepted: false,
    visitedSteps: new Set(),
  };

  const mockUpdateFormData = vi.fn((updates) => {
    Object.assign(mockFormData, updates);
  });
  const mockOnNext = vi.fn();
  const mockOnPrev = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset form data to initial state
    Object.assign(mockFormData, {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      communicationMethod: '',
      packageType: '',
      riceKrispies: 0,
      oreos: 0,
      pretzels: 0,
      marshmallows: 0,
      colorScheme: '',
      eventType: '',
      theme: '',
      pickupDate: '',
      pickupTime: '',
      rushOrder: false,
      referralSource: '',
      termsAccepted: false,
      visitedSteps: new Set(),
    });
  });

  const renderComponent = () => {
    return render(
      <LeadQuestions
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={mockOnSubmit}
        isFirstStep={true}
        isLastStep={false}
      />
    );
  };

  it('renders all form fields with proper labels', () => {
    renderComponent();

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });

  it('shows error messages for required fields when form is submitted with empty values', async () => {
    const user = userEvent.setup();
    renderComponent();

    // The Next button should be disabled when form is invalid
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();

    // Test validation by interacting with fields and then blurring
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const phoneInput = screen.getByLabelText(/phone number/i);

    // Focus and blur each field to trigger validation
    await user.click(firstNameInput);
    await user.tab();
    await user.click(lastNameInput);
    await user.tab();
    await user.click(emailInput);
    await user.tab();
    await user.click(phoneInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email address is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });
  });

  it('validates email format correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByLabelText(/email address/i);

    // Test invalid email
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur event

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });

    // Test valid email
    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText('Please enter a valid email address')
      ).not.toBeInTheDocument();
    });
  });

  it('validates phone number format correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    const phoneInput = screen.getByLabelText(/phone number/i);

    // Test invalid phone
    await user.type(phoneInput, '123');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid phone number (123-456-7890)')
      ).toBeInTheDocument();
    });

    // Test valid phone
    await user.clear(phoneInput);
    await user.type(phoneInput, '1234567890');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText('Please enter a valid phone number (123-456-7890)')
      ).not.toBeInTheDocument();
    });
  });

  it('validates name fields correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstNameInput = screen.getByLabelText(/first name/i);

    // Test single character
    await user.type(firstNameInput, 'A');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('First name must be at least 2 characters')
      ).toBeInTheDocument();
    });

    // Test valid name
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'John');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText('First name must be at least 2 characters')
      ).not.toBeInTheDocument();
    });
  });

  it('formats phone number automatically', async () => {
    const user = userEvent.setup();
    renderComponent();

    const phoneInput = screen.getByLabelText(/phone number/i);

    await user.type(phoneInput, '1234567890');

    // Check that the last call was with the formatted phone number
    expect(mockUpdateFormData).toHaveBeenLastCalledWith({
      phone: '123-456-7890',
    });
  });

  it('enables next button only when all fields are valid', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();

    // Fill in all fields with valid data
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(
      screen.getByLabelText(/email address/i),
      'john@example.com'
    );
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');

    await waitFor(() => {
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('calls onNext when form is valid and next button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Fill in all fields with valid data
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(
      screen.getByLabelText(/email address/i),
      'john@example.com'
    );
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');

    const nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('does not call onNext when form is invalid', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('provides proper accessibility attributes for error states', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByLabelText(/email address/i);

    // Trigger error state
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      expect(
        screen.getByText('Please enter a valid email address')
      ).toHaveAttribute('role', 'alert');
      expect(
        screen.getByText('Please enter a valid email address')
      ).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('only shows errors for fields that have been touched', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Fill in email but don't blur (not touched)
    await user.clear(screen.getByLabelText(/email address/i));
    await user.type(screen.getByLabelText(/email address/i), 'invalid-email');

    // Should not show error yet
    expect(
      screen.queryByText('Please enter a valid email address')
    ).not.toBeInTheDocument();

    // Now blur to mark as touched
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });
  });

  it('handles special characters in names correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    const firstNameInput = screen.getByLabelText(/first name/i);

    // Test valid special characters
    await user.type(firstNameInput, "O'Connor");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText(/can only contain letters/i)
      ).not.toBeInTheDocument();
    });

    // Test invalid characters
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'John123');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(
          /can only contain letters, spaces, hyphens, and apostrophes/i
        )
      ).toBeInTheDocument();
    });
  });
});
