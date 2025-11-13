import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesignPackagePage } from './DesignPackagePage';
import { formDataApi } from '@/api/formDataApi';

const createInitialFormData = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  communicationMethod: '' as '' | 'email' | 'text',
  packageType: '' as '' | 'small' | 'medium' | 'large' | 'xl' | 'by-dozen',
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
  rushOrder: false,
  referralSource: '',
  termsAccepted: false,
  visitedSteps: new Set(['lead']),
});

const createStoredFormData = () => ({
  id: 'form-123',
  formData: createInitialFormData(),
  currentStep: 0,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/api/formDataApi', () => {
  return {
    formDataApi: {
      create: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
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

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

const renderDesignPackagePage = (queryClient?: QueryClient) => {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  render(
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <DesignPackagePage />
      </BrowserRouter>
    </QueryClientProvider>
  );

  return client;
};

describe('DesignPackagePage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockScrollTo.mockReset();
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
    localStorageMock.getItem.mockReturnValue(null);

    const storedForm = createStoredFormData();
    vi.mocked(formDataApi.create).mockClear().mockResolvedValue(storedForm);
    vi.mocked(formDataApi.get).mockClear().mockResolvedValue(storedForm);
    vi.mocked(formDataApi.update).mockClear().mockResolvedValue(storedForm);
  });

  it('renders the page header', async () => {
    renderDesignPackagePage();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Design Your Package' })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Let's create your perfect chocolate-covered treats!")
      ).toBeInTheDocument();
    });
  });

  it('does not persist when inputs change, but updates the input value', async () => {
    localStorageMock.getItem.mockReturnValue('form-123');
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['formData', 'form-123'], createStoredFormData());

    renderDesignPackagePage(queryClient);

    await waitFor(() => {
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText('First Name *');
    fireEvent.change(firstNameInput, { target: { value: 'Jordan' } });

    await waitFor(() => {
      expect(firstNameInput).toHaveValue('Jordan');
    });

    expect(formDataApi.update).not.toHaveBeenCalled();
  });

  it('persists form data once when navigating to the next step', async () => {
    localStorageMock.getItem.mockReturnValue('form-123');
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['formData', 'form-123'], createStoredFormData());

    renderDesignPackagePage(queryClient);

    await waitFor(() => {
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('First Name *'), {
      target: { value: 'Jordan' },
    });
    fireEvent.change(screen.getByLabelText('Last Name *'), {
      target: { value: 'Smith' },
    });
    fireEvent.change(screen.getByLabelText('Email Address *'), {
      target: { value: 'jordan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Phone Number *'), {
      target: { value: '123-456-7890' },
    });

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(formDataApi.update).toHaveBeenCalledTimes(1);
    });

    const [, payload] = vi.mocked(formDataApi.update).mock.calls[0];
    expect(payload?.currentStep).toBe(1);
    expect(payload?.formData?.firstName).toBe('Jordan');
    expect(payload?.formData?.lastName).toBe('Smith');
    expect(Array.from(payload?.formData?.visitedSteps ?? [])).toContain(
      'communication'
    );
  });

  it('persists when navigating backward', async () => {
    localStorageMock.getItem.mockReturnValue('form-123');
    const stored = createStoredFormData();
    stored.formData.visitedSteps = new Set(['lead', 'communication']);
    stored.currentStep = 1;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['formData', 'form-123'], stored);

    renderDesignPackagePage(queryClient);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    vi.mocked(formDataApi.update).mockClear();

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(formDataApi.update).toHaveBeenCalledTimes(1);
    });

    const [, payload] = vi.mocked(formDataApi.update).mock.calls[0];
    expect(payload?.currentStep).toBe(0);
  });

  it('persists when navigating via sidebar', async () => {
    localStorageMock.getItem.mockReturnValue('form-123');
    const stored = createStoredFormData();
    stored.formData.visitedSteps = new Set([
      'lead',
      'communication',
      'package',
      'color',
    ]);
    stored.currentStep = 3;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['formData', 'form-123'], stored);

    renderDesignPackagePage(queryClient);

    await waitFor(() => {
      expect(screen.getByText('Your Progress')).toBeInTheDocument();
    });

    vi.mocked(formDataApi.update).mockClear();

    const leadStep = screen
      .getByText('Contact Information')
      .closest('[class*="stepItem"]');
    fireEvent.click(leadStep!);

    await waitFor(() => {
      expect(formDataApi.update).toHaveBeenCalledTimes(1);
    });

    const [, payload] = vi.mocked(formDataApi.update).mock.calls[0];
    expect(payload?.currentStep).toBe(0);
  });

  it('scrolls to the step header after navigation', async () => {
    localStorageMock.getItem.mockReturnValue('form-123');
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(['formData', 'form-123'], createStoredFormData());

    const mockElement = {
      getBoundingClientRect: () => ({ top: 100, height: 50 }),
    } as HTMLElement;
    const originalQuerySelector = document.querySelector;
    document.querySelector = vi.fn().mockReturnValue(mockElement);

    renderDesignPackagePage(queryClient);

    await waitFor(() => {
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('First Name *'), {
      target: { value: 'Jordan' },
    });
    fireEvent.change(screen.getByLabelText('Last Name *'), {
      target: { value: 'Smith' },
    });
    fireEvent.change(screen.getByLabelText('Email Address *'), {
      target: { value: 'jordan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Phone Number *'), {
      target: { value: '123-456-7890' },
    });

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 20,
        behavior: 'smooth',
      });
    });

    document.querySelector = originalQuerySelector;
  });
});
