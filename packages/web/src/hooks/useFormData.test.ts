import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFormData } from './useFormData';
import { formDataApi } from '@/api/formDataApi';
import type { FormData } from '@sweetly-dipped/shared-types';

// Mock the API
vi.mock("@/api/formDataApi", () => ({
  formDataApi: {
    create: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    health: vi.fn(),
    generateOrderNumber: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const mockFormData: FormData = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "123-456-7890",
  communicationMethod: "email",
  packageType: "medium",
  riceKrispies: 2,
  oreos: 1,
  pretzels: 0,
  marshmallows: 1,
  colorScheme: "Blue",
  eventType: "Birthday",
  theme: "Superhero",
  additionalDesigns: "",
  pickupDate: "2025-01-15",
  pickupTime: "2:00 PM",
  rushOrder: false,
  referralSource: "Social Media",
  termsAccepted: true,
  visitedSteps: new Set(["lead", "communication"]),
};

const mockStoredFormData = {
  id: "form-123",
  formData: mockFormData,
  currentStep: 0,
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

describe("useFormData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("initialization", () => {
    it("initializes without form ID when none exists in localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useFormData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.formId).toBeNull();
      expect(result.current.formData).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("loads existing form ID from localStorage", () => {
      localStorageMock.getItem.mockReturnValue("form-123");

      const { result } = renderHook(() => useFormData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.formId).toBe("form-123");
    });
  });

  describe("form initialization", () => {
    it("creates new form data when initialized", async () => {
      const mockCreatedForm = {
        id: "form-123",
        formData: mockFormData,
        currentStep: 0,
        createdAt: "2025-01-15T10:00:00Z",
        updatedAt: "2025-01-15T10:00:00Z",
      };

      vi.mocked(formDataApi.create).mockResolvedValue(mockCreatedForm);

      const { result } = renderHook(() => useFormData(), {
        wrapper: createWrapper(),
      });

      await result.current.initializeForm(mockFormData, 0);

      expect(formDataApi.create).toHaveBeenCalledWith({
        formData: mockFormData,
        currentStep: 0,
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "sweetly-dipped-form-id",
        "form-123"
      );
    });
  });

  describe("form data updates", () => {
    it("updates form data successfully", async () => {
      const mockUpdatedForm = {
        id: "form-123",
        formData: { ...mockFormData, firstName: "Jane" },
        currentStep: 2,
        createdAt: "2025-01-15T10:00:00Z",
        updatedAt: "2025-01-15T11:00:00Z",
      };

      vi.mocked(formDataApi.update).mockResolvedValue(mockUpdatedForm);

      // Set form ID in localStorage before rendering hook
      localStorageMock.getItem.mockReturnValue("form-123");

      // Create a wrapper with pre-populated query cache
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      queryClient.setQueryData(["formData", "form-123"], mockStoredFormData);

      const wrapper = ({ children }: { children: React.ReactNode }) => {
        return React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children
        );
      };

      const { result } = renderHook(() => useFormData(), { wrapper });

      // Wait for the hook to load the form ID
      await waitFor(() => {
        expect(result.current.formId).toBe("form-123");
      });

      await result.current.updateFormData({ firstName: "Jane" });

      expect(formDataApi.update).toHaveBeenCalledWith("form-123", {
        formData: { ...mockFormData, firstName: "Jane" },
      });
    });

    it("throws error when trying to update without form ID", async () => {
      const { result } = renderHook(() => useFormData(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.updateFormData({ firstName: "Jane" })
      ).rejects.toThrow("Form not initialized");
    });
  });

  describe("step updates", () => {
    it("updates current step successfully", async () => {
      const mockUpdatedForm = {
        id: "form-123",
        formData: mockFormData,
        currentStep: 3,
        createdAt: "2025-01-15T10:00:00Z",
        updatedAt: "2025-01-15T11:00:00Z",
      };

      vi.mocked(formDataApi.update).mockResolvedValue(mockUpdatedForm);

      // Set form ID in localStorage before rendering hook
      localStorageMock.getItem.mockReturnValue("form-123");

      const { result } = renderHook(() => useFormData(), {
        wrapper: createWrapper(),
      });

      // Wait for the hook to load the form ID and set up query cache
      await waitFor(() => {
        expect(result.current.formId).toBe("form-123");
      });

      // Manually set the query data in the cache
      const queryClient = new QueryClient();
      queryClient.setQueryData(["formData", "form-123"], mockStoredFormData);

      await result.current.updateCurrentStep(3);

      expect(formDataApi.update).toHaveBeenCalledWith("form-123", {
        currentStep: 3,
      });
    });
  });

  describe("form deletion", () => {
    it("clears localStorage only (does not delete from server)", async () => {
      // Set form ID in localStorage before rendering hook
      localStorageMock.getItem.mockReturnValue("form-123");

      const { result } = renderHook(() => useFormData(), {
        wrapper: createWrapper(),
      });

      // Wait for the hook to load the form ID
      await waitFor(() => {
        expect(result.current.formId).toBe("form-123");
      });

      await result.current.clearFormData();

      // Should only clear localStorage, not call API delete
      expect(formDataApi.delete).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "sweetly-dipped-form-id"
      );

      // Wait for the form ID to be cleared
      await waitFor(() => {
        expect(result.current.formId).toBeNull();
      });
    });
  });

  describe("loading states", () => {
    it("shows loading state when fetching form data", async () => {
      localStorageMock.getItem.mockReturnValue("form-123");
      vi.mocked(formDataApi.get).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useFormData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
    });
  });
});
