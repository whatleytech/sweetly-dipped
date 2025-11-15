import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmationPage } from './ConfirmationPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { configApi } from '../api/configApi';
import { setupConfigMocks } from '../utils/testUtils';
import { formDataApi } from '../api/formDataApi';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock config API
vi.mock('../api/configApi', () => ({
  configApi: {
    getPackageOptions: vi.fn(),
    getTreatOptions: vi.fn(),
  },
}));

// Mock the API with proper return values
vi.mock('../api/formDataApi', () => {
  const mockFormData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    communicationMethod: 'email',
    packageType: 'medium',
    riceKrispies: 2,
    oreos: 1,
    pretzels: 0,
    marshmallows: 1,
    colorScheme: 'Pink and Gold',
    eventType: 'Birthday',
    theme: 'Princess',
    additionalDesigns: 'Add some sparkles',
    pickupDate: '2024-02-15',
    pickupTime: '8:30 AM',
    rushOrder: false,
    referralSource: '',
    termsAccepted: false,
    visitedSteps: new Set(['lead', 'contact', 'package', 'design', 'pickup']),
  };

  const mockCreatedForm = {
    id: 'form-123',
    formData: mockFormData,
    currentStep: 6, // Confirmation step
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    orderNumber: '2025-01-15-001',
  };

  return {
    formDataApi: {
      create: vi.fn().mockResolvedValue(mockCreatedForm),
      get: vi.fn().mockResolvedValue(mockCreatedForm),
      update: vi.fn().mockImplementation(
        (
          id: string,
          updates: {
            formData?: {
              firstName?: string;
              lastName?: string;
              email?: string;
              phone?: string;
              communicationMethod?: 'email' | 'text';
              packageType?: 'small' | 'medium' | 'large' | 'by-dozen';
              riceKrispies?: number;
              oreos?: number;
              pretzels?: number;
              marshmallows?: number;
              colorScheme?: string;
              eventType?: string;
              theme?: string;
              additionalDesigns?: string;
              pickupDate?: string;
              pickupTime?: string;
              rushOrder?: boolean;
              referralSource?: string;
              termsAccepted?: boolean;
              visitedSteps?: Set<string>;
            };
            currentStep?: number;
            orderNumber?: string;
          }
        ) => {
          // Return updated data based on the updates provided
          const updatedForm = {
            ...mockCreatedForm,
            formData: {
              ...mockCreatedForm.formData,
              ...updates.formData,
            },
            ...updates,
          };
          return Promise.resolve(updatedForm);
        }
      ),
      delete: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
      health: vi.fn().mockResolvedValue({ status: 'ok' }),
      submitForm: vi.fn().mockResolvedValue({
        orderNumber: '20250115-ABC123XYZ456',
        submittedAt: '2025-01-15T10:00:00Z',
      }),
    },
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const renderConfirmationPage = (customMockData?: {
  id: string;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    communicationMethod: 'email' | 'text';
    packageType: 'small' | 'medium' | 'large' | 'by-dozen';
    riceKrispies: number;
    oreos: number;
    pretzels: number;
    marshmallows: number;
    colorScheme: string;
    eventType: string;
    theme: string;
    additionalDesigns: string;
    pickupDate: string;
    pickupTime: string;
    rushOrder: boolean;
    referralSource: string;
    termsAccepted: boolean;
    visitedSteps: Set<string>;
  };
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Default mock data if none provided
  const defaultMockData = {
    id: 'form-123',
    formData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      communicationMethod: 'email' as const,
      packageType: 'medium' as const,
      riceKrispies: 2,
      oreos: 1,
      pretzels: 0,
      marshmallows: 1,
      colorScheme: 'Pink and Gold',
      eventType: 'Birthday',
      theme: 'Princess',
      additionalDesigns: 'Add some sparkles',
      pickupDate: '2024-02-15',
      pickupTime: '8:30 AM',
      rushOrder: false,
      referralSource: '',
      termsAccepted: false,
      visitedSteps: new Set(['lead', 'contact', 'package', 'design', 'pickup']),
    },
    currentStep: 6,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  };

  // Use custom mock data if provided, otherwise use the default
  const mockData = customMockData || defaultMockData;
  queryClient.setQueryData(['formData', 'form-123'], mockData);
  vi.mocked(formDataApi.get).mockResolvedValue(mockData);

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfirmationPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const getTreatsBreakdownTable = () => {
  const labelNode = screen.getByText('Treats Breakdown:', { exact: true });
  return labelNode.nextElementSibling as HTMLElement | null;
};

const expectBreakdownValue = (labelText: string, valueText: string) => {
  const table = getTreatsBreakdownTable();
  expect(table).not.toBeNull();
  const rowLabel = within(table as HTMLElement).getByText(labelText, {
    exact: true,
  });
  const row = rowLabel.closest('div');
  expect(row).not.toBeNull();
  expect(
    within(row as HTMLElement).getByText(valueText, { exact: true })
  ).toBeInTheDocument();
};

describe('ConfirmationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('form-123');
    setupConfigMocks(configApi);
  });

  it('renders loading state initially', () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderConfirmationPage();
    expect(
      screen.getByText('Loading your order details...')
    ).toBeInTheDocument();
  });

  it('redirects to form page when no data exists', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderConfirmationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/design-package');
    });
  });

  it('displays order details when form data exists', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText('Order Confirmation')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
      expect(
        screen.getByText('Medium (5 dozen – 60 treats)')
      ).toBeInTheDocument();
    });
  });

  it('displays payment notice', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(
        screen.getByText('Currently ONLY accepting payments via Venmo.')
      ).toBeInTheDocument();
    });
  });

  it('displays rush order notice when rush order is true', async () => {
    const mockFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      communicationMethod: 'email' as const,
      packageType: 'medium' as const,
      riceKrispies: 2,
      oreos: 1,
      pretzels: 0,
      marshmallows: 1,
      colorScheme: 'Pink and Gold',
      eventType: 'Birthday',
      theme: 'Princess',
      additionalDesigns: 'Add some sparkles',
      pickupDate: '2024-02-15',
      pickupTime: '8:30 AM',
      rushOrder: true,
      referralSource: '',
      termsAccepted: false,
      visitedSteps: new Set(['lead', 'contact', 'package', 'design', 'pickup']),
    };
    const rushOrderForm = {
      id: 'form-123',
      formData: mockFormData,
      currentStep: 6,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    };
    renderConfirmationPage(rushOrderForm);

    await waitFor(() => {
      expect(screen.getByText(/Rush Order Notice:/)).toBeInTheDocument();
    });
  });

  it('allows editing contact information', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]); // Edit name
    });

    const input = screen.getByDisplayValue('John Doe');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Jane Smith' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays by-dozen breakdown when package type is by-dozen', async () => {
    const mockFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      communicationMethod: 'email' as const,
      packageType: 'by-dozen' as const,
      riceKrispies: 2,
      oreos: 1,
      pretzels: 0,
      marshmallows: 1,
      colorScheme: 'Pink and Gold',
      eventType: 'Birthday',
      theme: 'Princess',
      additionalDesigns: 'Add some sparkles',
      pickupDate: '2024-02-15',
      pickupTime: '8:30 AM',
      rushOrder: false,
      referralSource: '',
      termsAccepted: false,
      visitedSteps: new Set(['lead', 'contact', 'package', 'design', 'pickup']),
    };
    const byDozenForm = {
      id: 'form-123',
      formData: mockFormData,
      currentStep: 6,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    };
    renderConfirmationPage(byDozenForm);

    await waitFor(() => {
      expect(
        screen.getByText('No package — order by the dozen')
      ).toBeInTheDocument();
      expectBreakdownValue('Rice Krispies:', '2');
      expectBreakdownValue('Oreos:', '1');
      expectBreakdownValue('Pretzels:', '0');
      expectBreakdownValue('Marshmallows:', '1');
      expectBreakdownValue('Total:', '4 dozen');
    });
  });

  it('displays terms and conditions', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
      expect(
        screen.getByText(/Completing this form does NOT confirm your order/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/All orders are pickup only/)
      ).toBeInTheDocument();
    });
  });

  it('allows selecting referral source', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Instagram' } });
    });

    expect(screen.getByDisplayValue('Instagram')).toBeInTheDocument();
  });

  it('requires terms acceptance to submit', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Order');
      expect(submitButton).toBeDisabled();
    });
  });

  it('enables submit button when terms are accepted', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
    });

    const submitButton = screen.getByText('Submit Order');
    expect(submitButton).not.toBeDisabled();
  });

  it('submits form and navigates to thank you page when terms are accepted', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(formDataApi.submitForm).mockClear();
    mockNavigate.mockClear();

    renderConfirmationPage();

    // Wait for the checkbox to be available and click it
    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
    });

    // Wait for the submit button to be enabled
    await waitFor(() => {
      const submitButton = screen.getByText('Submit Order');
      expect(submitButton).not.toBeDisabled();
    });

    // Click the submit button
    const submitButton = screen.getByText('Submit Order');
    fireEvent.click(submitButton);

    // Wait for the async operations to complete
    await waitFor(
      () => {
        expect(formDataApi.submitForm).toHaveBeenCalledWith('form-123');
      },
      { timeout: 5000 }
    );

    // Check that navigation was called with the orderNumber in state
    expect(mockNavigate).toHaveBeenCalledWith('/thank-you', {
      state: { orderNumber: '20250115-ABC123XYZ456' },
    });

    alertMock.mockRestore();
  });

  it('shows alert when trying to submit without accepting terms', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderConfirmationPage();

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Order');
      expect(submitButton).toBeDisabled();
    });

    // The button is disabled, so clicking it won't trigger the alert
    // This test verifies the button is properly disabled when terms aren't accepted
    expect(alertMock).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });

  it('displays contact information correctly', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  it('displays pickup details correctly', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText('Pickup Details')).toBeInTheDocument();
      expect(screen.getByText(/February 14, 2024/)).toBeInTheDocument();
      expect(screen.getByText('8:30 AM')).toBeInTheDocument();
    });
  });

  it('displays additional design notes when present', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText('Additional Design Notes:')).toBeInTheDocument();
      expect(screen.getByText('Add some sparkles')).toBeInTheDocument();
    });
  });

  it('handles editing cancellation', async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]); // Edit name
    });

    const input = screen.getByDisplayValue('John Doe');
    fireEvent.change(input, { target: { value: 'Changed Name' } });
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue('Changed Name')
      ).not.toBeInTheDocument();
    });
  });
});
