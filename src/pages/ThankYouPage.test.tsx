import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ThankYouPage } from "./ThankYouPage";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const mockFormData = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "123-456-7890",
  communicationMethod: "email" as const,
  packageType: "medium" as const,
  riceKrispies: 2,
  oreos: 1,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: "Pink and Gold",
  eventType: "Birthday Party",
  theme: "Princess",
  additionalDesigns: "",
  pickupDate: "2025-01-15",
  pickupTime: "8:30 AM",
  rushOrder: false,
  referralSource: "Instagram",
  termsAccepted: true,
  visitedSteps: new Set(["contact", "package", "design", "pickup", "confirmation"]),
};

describe("ThankYouPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set a fixed date for all tests: January 15, 2025
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders thank you message and order number", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        formData: mockFormData,
        orderNumber: "2025-01-15-001",
      })
    ); // Form data with order number

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Thank you for your order!")).toBeInTheDocument();
    expect(screen.getByText(/Order #: 2025-01-15-001/)).toBeInTheDocument();
  });

  it("displays package summary correctly", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        formData: mockFormData,
        orderNumber: "2025-01-15-001",
      })
    ); // Form data with order number

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    expect(
      screen.getByText("Medium (5 dozen – 60 treats)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pickup: January 15, 2025 at 8:30 AM")
    ).toBeInTheDocument();
  });

    it("displays by-the-dozen summary correctly", () => {
      const byDozenData = {
        ...mockFormData,
        packageType: "by-dozen" as const,
        riceKrispies: 3,
        oreos: 2,
        pretzels: 1,
        marshmallows: 1,
      };

      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({
          formData: byDozenData,
          orderNumber: "2025-01-15-001",
        })
      ); // Form data with order number

      render(
        <BrowserRouter>
          <ThankYouPage />
        </BrowserRouter>
      );

      expect(screen.getByText("Custom Order (7 dozen)")).toBeInTheDocument();
      expect(
        screen.getByText("3 dozen Chocolate covered Rice Krispies")
      ).toBeInTheDocument();
      expect(
        screen.getByText("2 dozen Chocolate covered Oreos")
      ).toBeInTheDocument();
      expect(
        screen.getByText("1 dozen Chocolate dipped pretzels")
      ).toBeInTheDocument();
      expect(
        screen.getByText("1 dozen Chocolate covered marshmallow pops")
      ).toBeInTheDocument();
    });

  it("displays Instagram message", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        formData: mockFormData,
        orderNumber: "2025-01-15-001",
      })
    ); // Form data with order number

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/Thank you for ordering with Sweetly Dipped!/)
    ).toBeInTheDocument();
    expect(screen.getByText("@sweetlydippedxjas")).toBeInTheDocument();
  });

  it("navigates to home and clears localStorage when return button is clicked", async () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        formData: mockFormData,
        orderNumber: "2025-01-15-001",
      })
    ); // Form data with order number

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    const returnButton = screen.getByRole("button", {
      name: /return to home/i,
    });
    fireEvent.click(returnButton);

    // Use real timers for this async test
    vi.useRealTimers();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "sweetly-dipped-form-data"
      );
    });
  });

  it("redirects to home if no form data exists", () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("redirects to home if form data is invalid JSON", () => {
    localStorageMock.getItem.mockReturnValue("invalid json");

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays different order numbers for different orders", () => {
    // First order
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        formData: mockFormData,
        orderNumber: "2025-01-15-001",
      })
    ); // Form data with order number

    const { unmount } = render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Order #: 2025-01-15-001/)).toBeInTheDocument();
    unmount();

    // Second order (same date, different order number)
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        formData: mockFormData,
        orderNumber: "2025-01-15-002",
      })
    ); // Form data with different order number

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Order #: 2025-01-15-002/)).toBeInTheDocument();
  });

  it("handles rush orders correctly", () => {
    const rushOrderData = {
      ...mockFormData,
      rushOrder: true,
    };

    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        formData: rushOrderData,
        orderNumber: "2025-01-15-001",
      })
    ); // Form data with order number

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    expect(
      screen.getByText("Medium (5 dozen – 60 treats)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pickup: January 15, 2025 at 8:30 AM")
    ).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        formData: mockFormData,
        orderNumber: "2025-01-15-001",
      })
    ); // Form data with order number

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    // Should not show loading for more than a brief moment
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("redirects to home if no order number exists", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        formData: mockFormData,
        // No orderNumber - should redirect to home
      })
    ); // Form data without order number

    render(
      <BrowserRouter>
        <ThankYouPage />
      </BrowserRouter>
    );

    // Should redirect to home if no order number exists
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
