 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ByTheDozen } from './ByTheDozen';
import type { FormData } from '../../pages/DesignPackagePage';
import React from 'react';

const baseData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  communicationMethod: '',
  packageType: 'by-dozen',
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

describe('ByTheDozen', () => {
  const updateFormData = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders grid headers and rows', () => {
    render(
      <ByTheDozen
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByText('Treat')).toBeInTheDocument();
    expect(screen.getByText('1 dozen')).toBeInTheDocument();
    expect(screen.getByText('4 dozen')).toBeInTheDocument();
    expect(screen.getByText(/Chocolate covered Rice Krispies/)).toBeInTheDocument();
  });

  it('disables continue when no selections are made', () => {
    render(
      <ByTheDozen
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('selects a quantity and enables continue', () => {
    render(
      <ByTheDozen
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const option = screen.getAllByText('1')[0].closest('label');
    fireEvent.click(option!);

    expect(updateFormData).toHaveBeenCalled();
  });

  it('calls onNext when continue is clicked after selection', () => {
    const data = { ...baseData, oreos: 2 };
    render(
      <ByTheDozen
        formData={data}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const btn = screen.getByRole('button', { name: /continue/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onNext).toHaveBeenCalled();
  });
});
