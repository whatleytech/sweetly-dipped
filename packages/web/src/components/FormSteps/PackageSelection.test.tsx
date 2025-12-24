 
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PackageSelection } from './PackageSelection';
import type { FormData } from '@sweetly-dipped/shared-types';
import { renderWithQueryClient, setupConfigMocks } from '@/utils/testUtils';
import { configApi } from '@/api/configApi';

vi.mock('@/api/configApi', () => ({
  configApi: {
    getPackageOptions: vi.fn(),
  },
}));


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
  selectedAdditionalDesigns: [],
  pickupDate: '',
  pickupTime: '',
  rushOrder: false,
  referralSource: '',
  termsAccepted: false,
  visitedSteps: new Set(),
};

describe('PackageSelection', () => {
  const updateFormData = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setupConfigMocks(configApi);
  });

  it('renders package options', async () => {
    renderWithQueryClient(
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

    await screen.findByText('Which package would you like to order?');
    expect(screen.getByText(/Small \(3 dozen/)).toBeInTheDocument();
    expect(screen.getByText(/Medium \(5 dozen/)).toBeInTheDocument();
    expect(screen.getByText(/Large \(8 dozen/)).toBeInTheDocument();
    expect(screen.getByText(/XL \(12 dozen/)).toBeInTheDocument();
    expect(screen.getByText(/No package — order by the dozen/)).toBeInTheDocument();
  });

  it('disables continue when nothing selected', async () => {
    renderWithQueryClient(
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
    await screen.findByText('Which package would you like to order?');
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('enables continue when a package is selected and calls onNext', async () => {
    const data = { ...baseData, packageType: 'medium' as const };
    renderWithQueryClient(
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

    await screen.findByText('Which package would you like to order?');
    const btn = screen.getByRole('button', { name: /continue/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onNext).toHaveBeenCalled();
  });

  it('updates form data when a radio is clicked', async () => {
    renderWithQueryClient(
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

    await screen.findByText('Which package would you like to order?');
    const medium = screen.getByText(/Medium \(5 dozen/).closest('div');
    fireEvent.click(medium!);
    expect(updateFormData).toHaveBeenCalledWith({ packageType: 'medium' });
  });
});
