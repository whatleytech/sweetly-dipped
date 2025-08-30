 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PackageSelection } from './PackageSelection';
import type { FormData } from '@sweetly-dipped/shared-types';


const baseData: FormData = {
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
  pickupTime: "",
  rushOrder: false,
  referralSource: "",
  termsAccepted: false,
};

describe('PackageSelection', () => {
  const updateFormData = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders package options', () => {
    render(
      <PackageSelection
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByText('Which package would you like to order?')).toBeInTheDocument();
    expect(screen.getByText(/Small \(3 dozen/)).toBeInTheDocument();
    expect(screen.getByText(/Medium \(5 dozen/)).toBeInTheDocument();
    expect(screen.getByText(/Large \(8 dozen/)).toBeInTheDocument();
    expect(screen.getByText(/XL \(12 dozen/)).toBeInTheDocument();
    expect(screen.getByText(/No package — order by the dozen/)).toBeInTheDocument();
  });

  it('disables continue when nothing selected', () => {
    render(
      <PackageSelection
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

  it('enables continue when a package is selected and calls onNext', () => {
    const data = { ...baseData, packageType: 'medium' as const };
    render(
      <PackageSelection
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

  it('updates form data when a radio is clicked', () => {
    render(
      <PackageSelection
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const medium = screen.getByText(/Medium \(5 dozen/).closest('div');
    fireEvent.click(medium!);
    expect(updateFormData).toHaveBeenCalledWith({ packageType: 'medium' });
  });
});
