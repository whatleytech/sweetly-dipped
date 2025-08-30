import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { DesignPackagePage } from "./DesignPackagePage";

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API with proper return values
vi.mock("../api/formDataApi", () => {
  const mockFormData = {
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
    rushOrder: false,
    referralSource: "",
    termsAccepted: false,
    visitedSteps: new Set(["lead"]),
  };

  const mockCreatedForm = {
    id: "form-123",
    formData: mockFormData,
    currentStep: 0,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
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
              communicationMethod?: "email" | "text";
              packageType?: "small" | "medium" | "large" | "by-dozen";
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
      health: vi.fn().mockResolvedValue({ status: "ok" }),
      generateOrderNumber: vi
        .fn()
        .mockResolvedValue({ orderNumber: "2025-01-15-001" }),
    },
  };
});

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

// Mock window.scrollTo for scroll functionality tests
const mockScrollTo = vi.fn();
Object.defineProperty(window, "scrollTo", {
  value: mockScrollTo,
  writable: true,
});

// Create a wrapper with QueryClient
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

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("DesignPackagePage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockScrollTo.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.getItem.mockReturnValue(null); // Start with no saved data
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title and description", async () => {
    // Set up localStorage to return null initially (no existing form)
    localStorageMock.getItem.mockReturnValue(null);

    render(<DesignPackagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Design Your Package")).toBeInTheDocument();
      expect(
        screen.getByText("Let's create your perfect chocolate-covered treats!")
      ).toBeInTheDocument();
    });
  });

  it("renders step header with correct step information (7 visible steps by default)", async () => {
    // Set up localStorage to return null initially (no existing form)
    localStorageMock.getItem.mockReturnValue(null);

    render(<DesignPackagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Allow for whitespace/newlines between tokens
      expect(screen.getByText(/Step\s*1\s*of\s*7/i)).toBeInTheDocument();
    });
  });

  it("renders the first step (Contact Information)", async () => {
    // Set up localStorage to return null initially (no existing form)
    localStorageMock.getItem.mockReturnValue(null);

    render(<DesignPackagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Contact Information")).toBeInTheDocument();
      expect(
        screen.getByText("Let's start with your contact information")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("First Name *")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name *")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address *")).toBeInTheDocument();
      expect(screen.getByLabelText("Phone Number *")).toBeInTheDocument();
    });
  });

  it("saves form data when form fields change", async () => {
    // Set up localStorage to return a form ID
    localStorageMock.getItem.mockReturnValue("form-123");

    // Pre-populate the query cache with form data
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const mockStoredFormData = {
      id: "form-123",
      formData: {
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
        rushOrder: false,
        referralSource: "",
        termsAccepted: false,
        visitedSteps: new Set(["lead"]),
      },
      currentStep: 0,
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-15T10:00:00Z",
    };

    queryClient.setQueryData(["formData", "form-123"], mockStoredFormData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DesignPackagePage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Wait for the form to load and then change the input
    await waitFor(() => {
      expect(screen.getByLabelText("First Name *")).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText("First Name *");
    fireEvent.change(firstNameInput, { target: { value: "John" } });

    // Wait for the form to be updated
    await waitFor(() => {
      expect(firstNameInput).toHaveValue("John");
    });
  });

  it("shows sidebar with progress information (7 steps by default)", async () => {
    // Set up localStorage to return null initially (no existing form)
    localStorageMock.getItem.mockReturnValue(null);

    render(<DesignPackagePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Your Progress")).toBeInTheDocument();
      expect(screen.getByText(/1 of 7 steps completed/)).toBeInTheDocument();
    });
  });

  it("scrolls to position step header at top when navigating between steps", async () => {
    // Set up localStorage to return null initially (no existing form)
    localStorageMock.getItem.mockReturnValue(null);

    // Mock querySelector to return a mock element
    const mockElement = {
      getBoundingClientRect: () => ({
        top: 100,
        height: 50,
      }),
    };
    const originalQuerySelector = document.querySelector;
    document.querySelector = vi.fn().mockReturnValue(mockElement);

    render(<DesignPackagePage />, { wrapper: createWrapper() });

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByLabelText("First Name *")).toBeInTheDocument();
    });

    // Fill out required fields to enable Continue button
    const firstNameInput = screen.getByLabelText("First Name *");
    const lastNameInput = screen.getByLabelText("Last Name *");
    const emailInput = screen.getByLabelText("Email Address *");
    const phoneInput = screen.getByLabelText("Phone Number *");

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "123-456-7890" } });

    // Click Continue to go to next step
    const continueButton = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueButton);

    // Wait for the scroll function to be called
    await waitFor(() => {
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 20, // Should scroll to element top (100) minus padding (80)
        behavior: "smooth",
      });
    });

    // Restore original querySelector
    document.querySelector = originalQuerySelector;
  });
});
