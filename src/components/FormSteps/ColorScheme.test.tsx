 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ColorScheme } from './ColorScheme';
import type { FormData } from '../../pages/DesignPackagePage';
import React from 'react';

const baseData: FormData = {
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
  additionalDesigns: '',
  pickupDate: '',
  pickupTime: '',
};

describe('ColorScheme', () => {
  const updateFormData = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label and input', () => {
    render(
      <ColorScheme
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByLabelText('Color Scheme *')).toBeInTheDocument();
  });

  it('disables continue when empty and enables when filled', () => {
    const { rerender } = render(
      <ColorScheme
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();

    rerender(
      <ColorScheme
        formData={{ ...baseData, colorScheme: 'Pink and Gold' }}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
  });

  it('calls updateFormData on input change', () => {
    render(
      <ColorScheme
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const input = screen.getByLabelText('Color Scheme *');
    fireEvent.change(input, { target: { value: 'Ivory and Gold' } });
    expect(updateFormData).toHaveBeenCalledWith({ colorScheme: 'Ivory and Gold' });
  });

  it('calls onPrev and onNext appropriately', () => {
    render(
      <ColorScheme
        formData={{ ...baseData, colorScheme: 'Blush Pink' }}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onPrev).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onNext).toHaveBeenCalled();
  });
});
