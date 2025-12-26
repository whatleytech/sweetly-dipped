import { screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PackagesTable } from './PackagesTable';
import { renderWithQueryClient, setupConfigMocks } from '@/utils/testUtils';
import { configApi } from '@/api/configApi';
import type { PackageOptionDto } from '@sweetly-dipped/shared-types';

vi.mock('@/api/configApi', () => ({
  configApi: {
    getPackageOptions: vi.fn(),
  },
}));

describe('PackagesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupConfigMocks(configApi);
  });

  it('renders all packages with correct information', async () => {
    // Override with proper structure matching API response
    const mockPackages: PackageOptionDto[] = [
      { id: 'small', label: 'Small', description: '3 dozen – 36 treats', price: 110 },
      { id: 'medium', label: 'Medium', description: '5 dozen – 60 treats', price: 180 },
      { id: 'large', label: 'Large', description: '8 dozen – 96 treats', price: 280 },
      {
        id: 'xl',
        label: 'XL',
        description: '12 dozen – 144 treats (Requires at least one month notice)',
        price: 420,
      },
      { id: 'by-dozen', label: 'By the dozen', description: 'No package — order by the dozen' },
    ];

    vi.mocked(configApi.getPackageOptions).mockResolvedValue(mockPackages);

    renderWithQueryClient(
      <BrowserRouter>
        <PackagesTable />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Small')).toBeInTheDocument();
    });

    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('3 dozen – 36 treats')).toBeInTheDocument();
    expect(screen.getByText('$110')).toBeInTheDocument();

    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('5 dozen – 60 treats')).toBeInTheDocument();
    expect(screen.getByText('$180')).toBeInTheDocument();

    expect(screen.getByText('Large')).toBeInTheDocument();
    expect(screen.getByText('8 dozen – 96 treats')).toBeInTheDocument();
    expect(screen.getByText('$280')).toBeInTheDocument();

    expect(screen.getByText('XL')).toBeInTheDocument();
    expect(
      screen.getByText('12 dozen – 144 treats (Requires at least one month notice)')
    ).toBeInTheDocument();
    expect(screen.getByText('$420')).toBeInTheDocument();

    expect(screen.getByText('By the dozen')).toBeInTheDocument();
    expect(screen.getByText('No package — order by the dozen')).toBeInTheDocument();
    expect(screen.getByText('Varies')).toBeInTheDocument();
  });
}); 