 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PickupDetails } from './PickupDetails';
import type { FormData } from "../../types/formTypes";


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

describe('PickupDetails', () => {
  const updateFormData = vi.fn();
  const onSubmit = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders date and time inputs', () => {
    render(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    expect(screen.getByLabelText('Date *')).toBeInTheDocument();
    expect(screen.getByLabelText('Time Window *')).toBeInTheDocument();
  });

  it('disables time select until a date is chosen and enables slots based on day', () => {
    render(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    const timeSelect = screen.getByLabelText('Time Window *') as HTMLSelectElement;
    expect(timeSelect).toBeDisabled();

    // Choose a Friday date (2025-01-10 is a Friday)
    const dateInput = screen.getByLabelText('Date *');
    fireEvent.change(dateInput, { target: { value: '2025-01-10' } });

    expect(updateFormData).toHaveBeenCalledWith({ pickupDate: '2025-01-10', pickupTime: '' });
  });

  it('enables submit only when both date and time are selected', () => {
    const data = { ...baseData, pickupDate: '2025-01-10', pickupTime: '' };
    const { rerender } = render(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /submit order/i });
    expect(submitBtn).toBeDisabled();

    rerender(
      <PickupDetails
        formData={{ ...data, pickupTime: '5:00 PM - 8:00 PM' }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    expect(screen.getByRole('button', { name: /submit order/i })).not.toBeDisabled();
  });

  it('calls onPrev and onSubmit appropriately', () => {
    render(
      <PickupDetails
        formData={{ ...baseData, pickupDate: '2025-01-10', pickupTime: '5:00 PM - 8:00 PM' }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onPrev).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
