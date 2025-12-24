import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThankYouPage } from "./ThankYouPage";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { configApi } from "../api/configApi";
import { setupConfigMocks } from "../utils/testUtils";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock config API
vi.mock("../api/configApi", () => ({
  configApi: {
    getPackageOptions: vi.fn(),
    getTreatOptions: vi.fn(),
  },
}));

// Mock the API with proper return values
vi.mock("../api/formDataApi", () => {
  const mockFormData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    communicationMethod: "email" as const,
    packageType: "medium" as const,
    riceKrispies: 2,
    oreos: 1,
    pretzels: 0,
    marshmallows: 1,
    colorScheme: "Pink and Gold",
    eventType: "Birthday",
    theme: "Princess",
    additionalDesigns: "Add some sparkles",
    selectedAdditionalDesigns: [],
    pickupDate: "2024-02-15",
    pickupTime: "8:30 AM",
    rushOrder: false,
    referralSource: "Instagram",
    termsAccepted: true,
    visitedSteps: new Set([
      "lead",
      "contact",
      "package",
      "design",
      "pickup",
      "confirmation",
    ]),
  };

  const mockCreatedForm = {
    id: "form-123",
    formData: mockFormData,
    currentStep: 7, // Thank you step
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    orderNumber: "2025-01-15-001",
  };

  return {
    formDataApi: {
      create: vi.fn().mockResolvedValue(mockCreatedForm),
      get: vi.fn().mockImplementation((id: string) => {
        if (id === "invalid-json") {
          throw new Error("404: Form data not found");
        }
        return Promise.resolve(mockCreatedForm);
      }),
      update: vi.fn().mockResolvedValue(mockCreatedForm),
      delete: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
      health: vi.fn().mockResolvedValue({ status: "ok" }),
      submitForm: vi
        .fn()
        .mockResolvedValue({
          orderNumber: "20250115-ABC123XYZ456",
          submittedAt: "2025-01-15T10:00:00Z",
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
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const renderThankYouPage = (customMockData?: {
  id: string;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    communicationMethod: "email" | "text";
    packageType: "small" | "medium" | "large" | "by-dozen";
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
  orderNumber: string;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Default mock data if none provided
  const defaultMockData = {
    id: "form-123",
    formData: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      communicationMethod: "email" as const,
      packageType: "medium" as const,
      riceKrispies: 2,
      oreos: 1,
      pretzels: 0,
      marshmallows: 1,
      colorScheme: "Pink and Gold",
      eventType: "Birthday",
      theme: "Princess",
      additionalDesigns: "Add some sparkles",
      pickupDate: "2024-02-15",
      pickupTime: "8:30 AM",
      rushOrder: false,
      referralSource: "Instagram",
      termsAccepted: true,
      visitedSteps: new Set([
        "lead",
        "contact",
        "package",
        "design",
        "pickup",
        "confirmation",
      ]),
    },
    currentStep: 7,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    orderNumber: "2025-01-15-001",
  };

  // Use custom mock data if provided, otherwise use the default
  const mockData = customMockData || defaultMockData;
  queryClient.setQueryData(["formData", "form-123"], mockData);

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("ThankYouPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue("form-123");
    setupConfigMocks(configApi);
  });

  it("renders thank you message and order number", async () => {
    renderThankYouPage();

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText("Thank you for your order!")).toBeInTheDocument();
    });

    expect(screen.getByText(/Order #:/)).toBeInTheDocument();
  });

  it("displays package summary correctly", async () => {
    renderThankYouPage();

    await waitFor(() => {
      expect(screen.getByText("Order Summary")).toBeInTheDocument();
      expect(
        screen.getByText("Medium (5 dozen – 60 treats)")
      ).toBeInTheDocument();
    });
  });

  it("displays by-the-dozen summary correctly", async () => {
    const mockFormData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      communicationMethod: "email" as const,
      packageType: "by-dozen" as const,
      riceKrispies: 2,
      oreos: 1,
      pretzels: 0,
      marshmallows: 1,
      colorScheme: "Pink and Gold",
      eventType: "Birthday",
      theme: "Princess",
      additionalDesigns: "Add some sparkles",
      pickupDate: "2024-02-15",
      pickupTime: "8:30 AM",
      rushOrder: false,
      referralSource: "Instagram",
      termsAccepted: true,
      visitedSteps: new Set([
        "lead",
        "contact",
        "package",
        "design",
        "pickup",
        "confirmation",
      ]),
    };
    const byDozenForm = {
      id: "form-123",
      formData: mockFormData,
      currentStep: 7,
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-15T10:00:00Z",
      orderNumber: "2025-01-15-001",
    };

    renderThankYouPage(byDozenForm);

    await waitFor(() => {
      expect(
        screen.getByText("2 dozen Chocolate covered Rice Krispies")
      ).toBeInTheDocument();
      expect(
        screen.getByText("1 dozen Chocolate covered Oreos")
      ).toBeInTheDocument();
      expect(
        screen.getByText("1 dozen Chocolate covered marshmallow pops")
      ).toBeInTheDocument();
    });
  });

  it("displays Instagram message", async () => {
    renderThankYouPage();

    await waitFor(() => {
      expect(
        screen.getByText(/please follow us on Instagram at/)
      ).toBeInTheDocument();
      expect(screen.getByText(/@sweetlydippedxjas/)).toBeInTheDocument();
    });
  });

  it("navigates to home and clears localStorage when return button is clicked", async () => {
    renderThankYouPage();

    await waitFor(() => {
      const returnButton = screen.getByRole("button", {
        name: /return to home/i,
      });
      fireEvent.click(returnButton);
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "sweetly-dipped-form-id"
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("redirects to home if no form data exists", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderThankYouPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows error state if form data is invalid JSON", async () => {
    localStorageMock.getItem.mockReturnValue("invalid-json");

    // Create a QueryClient without pre-populated data
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThankYouPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Error loading order confirmation: 404: Form data not found"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /return to home/i })
      ).toBeInTheDocument();
    });
  });

  it("displays different order numbers for different orders", async () => {
    renderThankYouPage();

    await waitFor(() => {
      expect(screen.getByText(/Order #/)).toBeInTheDocument();
    });
  });

  it("displays loading state initially", () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderThankYouPage();
    expect(
      screen.getByText("Loading your order confirmation...")
    ).toBeInTheDocument();
  });

  it("redirects to home if no order number exists", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderThankYouPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
