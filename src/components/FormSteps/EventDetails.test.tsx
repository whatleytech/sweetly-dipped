 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventDetails } from './EventDetails';
import type { FormData } from "../../types/formTypes";


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

describe('EventDetails', () => {
  const updateFormData = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inputs for event type and theme', () => {
    render(
      <EventDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByLabelText('Type of event')).toBeInTheDocument();
    expect(screen.getByLabelText('Theme')).toBeInTheDocument();
  });

  it('calls updateFormData on changes', () => {
    render(
      <EventDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    fireEvent.change(screen.getByLabelText('Type of event'), { target: { value: 'Wedding' } });
    fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'Garden' } });

    expect(updateFormData).toHaveBeenCalledWith({ eventType: 'Wedding' });
    expect(updateFormData).toHaveBeenCalledWith({ theme: 'Garden' });
  });

  it('navigates on back and continue', () => {
    render(
      <EventDetails
        formData={baseData}
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
