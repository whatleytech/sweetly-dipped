 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommunicationPreference } from './CommunicationPreference';
import type { FormData } from '../../pages/DesignPackagePage';
import React from 'react';

const mockFormData: FormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  communicationMethod: '',
  packageType: '',
  riceKrispies: 0,
  oreos: 0,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: '',
  eventType: '',
  theme: '',
  additionalDesigns: '',
  pickupDate: '',
  pickupTime: '',
};

describe('CommunicationPreference', () => {
  const mockUpdateFormData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the question title and description', () => {
    render(
      <CommunicationPreference
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByText('How would you like us to contact you?')).toBeInTheDocument();
    expect(screen.getByText("We'll use this method to confirm your order and keep you updated on your treats!")).toBeInTheDocument();
  });

  it('renders both communication options', () => {
    render(
      <CommunicationPreference
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Text Message')).toBeInTheDocument();
    expect(screen.getByText("We'll send order confirmations and updates to your email address")).toBeInTheDocument();
    expect(screen.getByText("We'll send order confirmations and updates via text message")).toBeInTheDocument();
  });

  it('calls updateFormData when email option is selected', () => {
    render(
      <CommunicationPreference
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const emailOption = screen.getByText('Email').closest('div');
    fireEvent.click(emailOption!);

    expect(mockUpdateFormData).toHaveBeenCalledWith({ communicationMethod: 'email' });
  });

  it('calls updateFormData when text option is selected', () => {
    render(
      <CommunicationPreference
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const textOption = screen.getByText('Text Message').closest('div');
    fireEvent.click(textOption!);

    expect(mockUpdateFormData).toHaveBeenCalledWith({ communicationMethod: 'text' });
  });

  it('shows selected state for email option', () => {
    const formDataWithEmail = {
      ...mockFormData,
      communicationMethod: 'email' as const,
    };

    render(
      <CommunicationPreference
        formData={formDataWithEmail}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const emailRadio = screen.getByDisplayValue('email');
    expect(emailRadio).toBeChecked();
  });

  it('shows selected state for text option', () => {
    const formDataWithText = {
      ...mockFormData,
      communicationMethod: 'text' as const,
    };

    render(
      <CommunicationPreference
        formData={formDataWithText}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const textRadio = screen.getByDisplayValue('text');
    expect(textRadio).toBeChecked();
  });

  it('disables continue button when no option is selected', () => {
    render(
      <CommunicationPreference
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when an option is selected', () => {
    const formDataWithSelection = {
      ...mockFormData,
      communicationMethod: 'email' as const,
    };

    render(
      <CommunicationPreference
        formData={formDataWithSelection}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).not.toBeDisabled();
  });

  it('calls onNext when continue button is clicked with valid selection', () => {
    const formDataWithSelection = {
      ...mockFormData,
      communicationMethod: 'email' as const,
    };

    render(
      <CommunicationPreference
        formData={formDataWithSelection}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('calls onPrev when back button is clicked', () => {
    render(
      <CommunicationPreference
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(mockOnPrev).toHaveBeenCalled();
  });

  it('does not call onNext when continue button is clicked without selection', () => {
    render(
      <CommunicationPreference
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    expect(mockOnNext).not.toHaveBeenCalled();
  });
});
