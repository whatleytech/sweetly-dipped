import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFormData } from "./useFormData";
import { formDataApi } from "@/api/formDataApi";
import type { FormData } from "@sweetly-dipped/shared-types";

vi.mock("@/api/formDataApi", () => ({
  formDataApi: {
    create: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    health: vi.fn(),
    submitForm: vi.fn(),
  },
}));

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const createMockFormData = (overrides: Partial<FormData> = {}): FormData => ({
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
  selectedAdditionalDesigns: [],
  pickupDate: "2025-01-15",
  pickupTime: "2:00 PM",
  rushOrder: false,
  referralSource: "Social Media",
  termsAccepted: true,
  visitedSteps: new Set(["lead", "communication"]),
  ...overrides,
});

const createMockStoredFormData = (
  overrides: Partial<{
    formData: FormData;
    currentStep: number;
    orderNumber?: string;
  }> = {},
) => ({
  id: "form-123",
  formData: overrides.formData ?? createMockFormData(),
  currentStep: overrides.currentStep ?? 0,
  orderNumber: overrides.orderNumber,
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
});

const createTestEnvironment = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, wrapper };
};

describe("useFormData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("initialization", () => {
    it("initializes without form ID when none exists in localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { wrapper } = createTestEnvironment();

      const { result } = renderHook(() => useFormData(), { wrapper });

      expect(result.current.formId).toBeNull();
      expect(result.current.formData).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("loads existing form ID from localStorage", async () => {
      localStorageMock.getItem.mockReturnValue("form-123");

      const { wrapper } = createTestEnvironment();

      const { result } = renderHook(() => useFormData(), { wrapper });

      await waitFor(() => {
        expect(result.current.formId).toBe("form-123");
      });
    });
  });

  describe("form initialization", () => {
    it("creates new form data when initialized", async () => {
      const mockCreatedForm = {
        id: "form-123",
        formData: createMockFormData(),
        currentStep: 0,
        createdAt: "2025-01-15T10:00:00Z",
        updatedAt: "2025-01-15T10:00:00Z",
      };

      vi.mocked(formDataApi.create).mockResolvedValue(mockCreatedForm);

      const { wrapper } = createTestEnvironment();

      const { result } = renderHook(() => useFormData(), { wrapper });

      await result.current.initializeForm(createMockFormData(), 0);

      expect(formDataApi.create).toHaveBeenCalledWith({
        formData: createMockFormData(),
        currentStep: 0,
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "sweetly-dipped-form-id",
        "form-123",
      );
    });
  });

  describe("persistFormProgress", () => {
    it("persists form data and current step together", async () => {
      localStorageMock.getItem.mockReturnValue("form-123");

      const { queryClient, wrapper } = createTestEnvironment();
      const storedForm = createMockStoredFormData();
      queryClient.setQueryData(["formData", "form-123"], storedForm);

      const updatedFormData = createMockFormData({ firstName: "Jane" });

      vi.mocked(formDataApi.update).mockResolvedValue({
        ...storedForm,
        formData: updatedFormData,
        currentStep: 2,
      });

      const { result } = renderHook(() => useFormData(), { wrapper });

      await waitFor(() => {
        expect(result.current.formId).toBe("form-123");
      });

      await result.current.persistFormProgress({
        formData: updatedFormData,
        currentStep: 2,
      });

      expect(formDataApi.update).toHaveBeenCalledWith(
        "form-123",
        expect.objectContaining({
          formData: updatedFormData,
          currentStep: 2,
        }),
      );
    });

    it("uses cached form data when only step is provided", async () => {
      localStorageMock.getItem.mockReturnValue("form-123");

      const { queryClient, wrapper } = createTestEnvironment();
      const storedForm = createMockStoredFormData();
      queryClient.setQueryData(["formData", "form-123"], storedForm);

      vi.mocked(formDataApi.update).mockResolvedValue({
        ...storedForm,
        currentStep: 3,
      });

      const { result } = renderHook(() => useFormData(), { wrapper });

      await waitFor(() => {
        expect(result.current.formId).toBe("form-123");
      });

      await result.current.persistFormProgress({ currentStep: 3 });

      expect(formDataApi.update).toHaveBeenCalledWith(
        "form-123",
        expect.objectContaining({
          formData: storedForm.formData,
          currentStep: 3,
        }),
      );
    });


    it("throws when attempting to persist without an initialized form", async () => {
      const { wrapper } = createTestEnvironment();

      const { result } = renderHook(() => useFormData(), { wrapper });

      await expect(
        result.current.persistFormProgress({ currentStep: 1 }),
      ).rejects.toThrow("Form not initialized");
    });
  });

  describe("submitForm", () => {
    it("submits form successfully", async () => {
      localStorageMock.getItem.mockReturnValue("form-123");

      const { wrapper } = createTestEnvironment();

      const mockSubmitResponse = {
        orderNumber: "20250115-ABC123XYZ456",
        submittedAt: "2025-01-15T10:00:00Z",
      };

      vi.mocked(formDataApi.submitForm).mockResolvedValue(mockSubmitResponse);

      const { result } = renderHook(() => useFormData(), { wrapper });

      await waitFor(() => {
        expect(result.current.formId).toBe("form-123");
      });

      const response = await result.current.submitForm();

      expect(formDataApi.submitForm).toHaveBeenCalledWith("form-123");
      expect(response).toEqual(mockSubmitResponse);
    });

    it("throws error when form ID is not available", async () => {
      const { wrapper } = createTestEnvironment();

      const { result } = renderHook(() => useFormData(), { wrapper });

      await expect(result.current.submitForm()).rejects.toThrow(
        "No form ID available"
      );
    });
  });

  describe("form deletion", () => {
    it("clears localStorage without deleting server data", async () => {
      localStorageMock.getItem.mockReturnValue("form-123");

      const { wrapper } = createTestEnvironment();

      const { result } = renderHook(() => useFormData(), { wrapper });

      await waitFor(() => {
        expect(result.current.formId).toBe("form-123");
      });

      await result.current.clearFormData();

      expect(formDataApi.delete).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "sweetly-dipped-form-id",
      );

      await waitFor(() => {
        expect(result.current.formId).toBeNull();
      });
    });
  });

  describe("loading states", () => {
    it("shows loading state when fetching form data", async () => {
      localStorageMock.getItem.mockReturnValue("form-123");
      vi.mocked(formDataApi.get).mockImplementation(
        () => new Promise(() => {}),
      );

      const { wrapper } = createTestEnvironment();

      const { result } = renderHook(() => useFormData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
    });
  });
});
