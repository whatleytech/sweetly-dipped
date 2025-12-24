import { screen, within } from '@testing-library/react';
import { PackageDetails } from './PackageDetails';
import type { FormData } from '@sweetly-dipped/shared-types';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithQueryClient, setupConfigMocks } from '@/utils/testUtils';
import { configApi } from '@/api/configApi';

vi.mock('@/api/configApi', () => ({
  configApi: {
    getPackageOptions: vi.fn(),
    getTreatOptions: vi.fn(),
  },
}));

const mockFormData: FormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  communicationMethod: 'email',
  packageType: 'medium',
  riceKrispies: 0,
  oreos: 0,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: 'Pink and Gold',
  eventType: 'Birthday',
  theme: 'Princess',
  additionalDesigns: 'Add some sparkles',
  selectedAdditionalDesigns: [],
  pickupDate: '2024-02-15',
  pickupTime: '8:30 AM',
  rushOrder: false,
  referralSource: '',
  termsAccepted: false,
  visitedSteps: new Set(),
};

const getRowForLabel = (labelText: string, occurrence = 0) => {
  const labels = screen.getAllByText(labelText, { exact: true });
  const labelNode = labels[occurrence];
  if (!labelNode) {
    throw new Error(
      `Unable to find label "${labelText}" at occurrence ${occurrence}`
    );
  }
  const row = labelNode.closest('div');
  if (!row) {
    throw new Error(`Unable to find row for label "${labelText}"`);
  }
  return row as HTMLElement;
};

const expectRowValue = (
  labelText: string,
  valueText: string,
  occurrence = 0
) => {
  const row = getRowForLabel(labelText, occurrence);
  expect(within(row).getByText(valueText, { exact: true })).toBeInTheDocument();
};

describe('PackageDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupConfigMocks(configApi);
  });

  it('renders package type correctly', async () => {
    renderWithQueryClient(<PackageDetails formData={mockFormData} />);

    await screen.findByText('Package Details');

    expect(screen.getByText('Package Details')).toBeInTheDocument();
    expect(screen.getByText('Package Type:')).toBeInTheDocument();
    expect(
      screen.getByText('Medium (5 dozen – 60 treats)')
    ).toBeInTheDocument();
  });

  it('displays correct total for pre-defined package', async () => {
    renderWithQueryClient(<PackageDetails formData={mockFormData} />);

    await screen.findByText('Package Details');

    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$180')).toBeInTheDocument();
  });

  it('displays by-dozen breakdown when package type is by-dozen', async () => {
    const byDozenData = {
      ...mockFormData,
      packageType: 'by-dozen' as const,
      riceKrispies: 2,
      oreos: 1,
      pretzels: 0,
      marshmallows: 1,
    };

    renderWithQueryClient(<PackageDetails formData={byDozenData} />);

    expect(screen.getByText('Treats Breakdown:')).toBeInTheDocument();
    expectRowValue('Rice Krispies:', '2');
    expectRowValue('Oreos:', '1');
    expectRowValue('Pretzels:', '0');
    expectRowValue('Marshmallows:', '1');
    expectRowValue('Total:', '4 dozen');
  });

  it('calculates correct total for by-dozen order', () => {
    const byDozenData = {
      ...mockFormData,
      packageType: 'by-dozen' as const,
      riceKrispies: 2, // 2 * $40 = $80
      oreos: 1, // 1 * $30 = $30
      pretzels: 0, // 0 * $30 = $0
      marshmallows: 1, // 1 * $40 = $40
    };

    renderWithQueryClient(<PackageDetails formData={byDozenData} />);

    expect(
      screen.getByText('Deposit due within 48 hours:')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Remainder due 1 week before event:')
    ).toBeInTheDocument();
    expect(screen.getAllByText('$75')).toHaveLength(2);
    // Total: $80 + $30 + $0 + $40 = $150
    expectRowValue('Total:', '$150', 1);
  });

  it('displays correct totals for different package types', async () => {
    const testCases = [
      { packageType: 'small', expectedTotal: '$110' },
      { packageType: 'medium', expectedTotal: '$180' },
      { packageType: 'large', expectedTotal: '$280' },
      { packageType: 'xl', expectedTotal: '$420' },
    ];

    for (const { packageType, expectedTotal } of testCases) {
      const testData = {
        ...mockFormData,
        packageType: packageType as FormData['packageType'],
      };

      const { unmount } = renderWithQueryClient(
        <PackageDetails formData={testData} />
      );
      await screen.findByText('Package Details');
      expect(screen.getByText(expectedTotal)).toBeInTheDocument();
      unmount();
    }
  });

  it('handles empty package type gracefully', () => {
    const emptyData = {
      ...mockFormData,
      packageType: '' as const,
    };

    renderWithQueryClient(<PackageDetails formData={emptyData} />);

    expect(screen.getByText('Package Type:')).toBeInTheDocument();
    expect(screen.getAllByText('$0')).toHaveLength(3);
  });

  it('calculates complex by-dozen order correctly', () => {
    const complexOrder = {
      ...mockFormData,
      packageType: 'by-dozen' as const,
      riceKrispies: 3, // 3 * $40 = $120
      oreos: 2, // 2 * $30 = $60
      pretzels: 1, // 1 * $30 = $30
      marshmallows: 2, // 2 * $40 = $80
    };

    renderWithQueryClient(<PackageDetails formData={complexOrder} />);

    // Total: $120 + $60 + $30 + $80 = $290
    expect(screen.getByText('$290')).toBeInTheDocument();
    expectRowValue('Total:', '8 dozen');
  });
});
