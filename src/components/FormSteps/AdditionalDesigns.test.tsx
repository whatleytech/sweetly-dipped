 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdditionalDesigns } from './AdditionalDesigns';
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
};

describe('AdditionalDesigns', () => {
  const updateFormData = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea', () => {
    render(
      <AdditionalDesigns
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByLabelText('Design notes (optional)')).toBeInTheDocument();
  });

  it('updates text on change', () => {
    render(
      <AdditionalDesigns
        formData={baseData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const textarea = screen.getByLabelText('Design notes (optional)');
    fireEvent.change(textarea, { target: { value: 'Custom logo and gold leaf accents' } });
    expect(updateFormData).toHaveBeenCalledWith({ additionalDesigns: 'Custom logo and gold leaf accents' });
  });

  it('navigates with back/continue', () => {
    render(
      <AdditionalDesigns
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
