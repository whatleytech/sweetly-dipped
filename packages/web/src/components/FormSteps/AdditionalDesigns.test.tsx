import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdditionalDesigns } from './AdditionalDesigns';
import type { FormData } from '@sweetly-dipped/shared-types';
import { useAdditionalDesignOptions } from '@/hooks/useConfigQuery';
import { mockAdditionalDesignOptions } from '@/utils/testUtils';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AdditionalDesignOptionDto } from '@sweetly-dipped/shared-types';

vi.mock('@/hooks/useConfigQuery', () => ({
  useAdditionalDesignOptions: vi.fn(),
}));

const baseData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  communicationMethod: '',
  packageType: 'medium',
  riceKrispies: 0,
  oreos: 0,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: '',
  eventType: '',
  theme: '',
  additionalDesigns: '',
  selectedAdditionalDesigns: [],
  pickupDate: '',
  pickupTime: '',
  rushOrder: false,
  referralSource: '',
  termsAccepted: false,
  visitedSteps: new Set(),
};

describe('AdditionalDesigns', () => {
  const updateFormData = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAdditionalDesignOptions).mockReturnValue({
      data: mockAdditionalDesignOptions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<AdditionalDesignOptionDto[], Error>);
  });

  it('renders checkboxes for each design option', () => {
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

    expect(screen.getByLabelText(/Select Sprinkles/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Select Gold or silver painted/i)
    ).toBeInTheDocument();
  });

  it('displays option names and prices', () => {
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

    expect(screen.getByText('Sprinkles — $10')).toBeInTheDocument();
    expect(screen.getByText('Gold or silver painted — $15')).toBeInTheDocument();
  });

  it('displays option descriptions when available', () => {
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

    expect(screen.getByText('Custom sprinkles decoration')).toBeInTheDocument();
    expect(
      screen.getByText('Elegant metallic paint accents')
    ).toBeInTheDocument();
  });

  it('toggles checkbox selection on click', () => {
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

    const checkbox = screen.getByLabelText(/Select Sprinkles/i);
    fireEvent.click(checkbox);

    expect(updateFormData).toHaveBeenCalledWith({
      selectedAdditionalDesigns: ['design-1'],
    });
  });

  it('removes option from selection when toggling off', () => {
    const formDataWithSelection = {
      ...baseData,
      selectedAdditionalDesigns: ['design-1', 'design-2'],
    };

    render(
      <AdditionalDesigns
        formData={formDataWithSelection}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const checkbox = screen.getByLabelText(/Select Sprinkles/i);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    expect(updateFormData).toHaveBeenCalledWith({
      selectedAdditionalDesigns: ['design-2'],
    });
  });

  it('displays correct price for small package', () => {
    const smallPackageData = { ...baseData, packageType: 'small' as const };
    render(
      <AdditionalDesigns
        formData={smallPackageData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    expect(screen.getByText('Sprinkles — $10')).toBeInTheDocument();
    expect(screen.getByText('Gold or silver painted — $15')).toBeInTheDocument();
  });

  it('displays correct price for large package with price increase', () => {
    const largePackageData = { ...baseData, packageType: 'large' as const };
    render(
      <AdditionalDesigns
        formData={largePackageData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    // Sprinkles has no increase, so base price
    expect(screen.getByText('Sprinkles — $10')).toBeInTheDocument();
    // Gold/silver has $5 increase, so $15 + $5 = $20
    expect(screen.getByText('Gold or silver painted — $20')).toBeInTheDocument();
  });

  it('displays correct price for by-dozen package', () => {
    const byDozenData = { ...baseData, packageType: 'by-dozen' as const };
    render(
      <AdditionalDesigns
        formData={byDozenData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    // Uses perDozenPrice when available
    expect(screen.getByText('Sprinkles — $8')).toBeInTheDocument();
    expect(screen.getByText('Gold or silver painted — $12')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useAdditionalDesignOptions).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<AdditionalDesignOptionDto[], Error>);

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

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useAdditionalDesignOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
      refetch: mockRefetch,
    } as unknown as UseQueryResult<AdditionalDesignOptionDto[], Error>);

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

    expect(screen.getByText(/Failed to load design options/)).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows message when no options available', () => {
    vi.mocked(useAdditionalDesignOptions).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<AdditionalDesignOptionDto[], Error>);

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

    expect(
      screen.getByText('No additional design options available at this time.')
    ).toBeInTheDocument();
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

  it('shows selected state for checked options', () => {
    const formDataWithSelection = {
      ...baseData,
      selectedAdditionalDesigns: ['design-1'],
    };

    render(
      <AdditionalDesigns
        formData={formDataWithSelection}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    const checkbox = screen.getByLabelText(/Select Sprinkles/i);
    expect(checkbox).toBeChecked();
  });
});
