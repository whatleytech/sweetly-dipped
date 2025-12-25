 
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ByTheDozen } from './ByTheDozen';
import type { FormData } from '@sweetly-dipped/shared-types';
import { renderWithQueryClient, setupConfigMocks } from '@/utils/testUtils';
import { configApi } from '@/api/configApi';

vi.mock('@/api/configApi', () => ({
  configApi: {
    getTreatOptions: vi.fn(),
  },
}));

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
  selectedAdditionalDesigns: [],
  pickupDate: '',
  pickupTime: '',
  rushOrder: false,
  referralSource: '',
  termsAccepted: false,
  visitedSteps: new Set(),
};

describe('ByTheDozen', () => {
  const updateFormData = vi.fn();
  const onNext = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setupConfigMocks(configApi);
  });

  it('renders grid headers and rows', async () => {
    renderWithQueryClient(
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

    await screen.findByText('Treat');
    expect(screen.getAllByText('1 dozen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4 dozen').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Chocolate covered Rice Krispies/).length
    ).toBeGreaterThan(0);
  });

  it('disables continue when no selections are made', async () => {
    renderWithQueryClient(
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

    await screen.findByText('Treat');
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('selects a quantity and enables continue', async () => {
    renderWithQueryClient(
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

    await screen.findByText('Treat');
    const option = screen.getAllByText('1')[0].closest('label');
    fireEvent.click(option!);

    expect(updateFormData).toHaveBeenCalled();
  });

  it('updates selection via mobile dropdown', async () => {
    renderWithQueryClient(
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

    const dropdown = await screen.findByLabelText(
      /Chocolate covered Rice Krispies/
    );
    fireEvent.change(dropdown, { target: { value: '3' } });

    expect(updateFormData).toHaveBeenCalledWith({ riceKrispies: 3 });
  });

  it('calls onNext when continue is clicked after selection', async () => {
    const data = { ...baseData, oreos: 2 };
    renderWithQueryClient(
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

    await screen.findByText('Treat');
    const btn = screen.getByRole('button', { name: /continue/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onNext).toHaveBeenCalled();
  });

  it('shows correct selected state for oreos', async () => {
    const data = { ...baseData, oreos: 2 };
    renderWithQueryClient(
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

    await screen.findByText('Treat');
    // Verify the correct radio is selected
    const oreosInput = screen
      .getAllByDisplayValue('2')
      .find(
        (input) => input.getAttribute('name') === 'oreos'
      ) as HTMLInputElement;
    expect(oreosInput?.checked).toBe(true);

    // Verify continue button is enabled with selection
    expect(
      screen.getByRole('button', { name: /continue/i })
    ).not.toBeDisabled();
  });

  it('unselects when clicking on already selected option', async () => {
    const data = { ...baseData, oreos: 2 };
    renderWithQueryClient(
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

    await screen.findByText('Treat');
    // Find the checked oreos radio input and click it
    const oreosInput = screen
      .getAllByDisplayValue('2')
      .find(
        (input) => input.getAttribute('name') === 'oreos'
      ) as HTMLInputElement;

    expect(oreosInput?.checked).toBe(true);

    // Click on the already selected option to unselect it
    fireEvent.click(oreosInput!);

    // Should call updateFormData with value 0 (unselected)
    expect(updateFormData).toHaveBeenCalledWith({ oreos: 0 });
  });

  it('disables continue when all selections are unselected', async () => {
    const updatedData = { ...baseData, oreos: 0 };
    renderWithQueryClient(
      <ByTheDozen
        formData={updatedData}
        updateFormData={updateFormData}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={vi.fn()}
        isFirstStep={false}
        isLastStep={false}
      />
    );

    await screen.findByText('Treat');
    // Continue should be disabled when no selections
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });
});
