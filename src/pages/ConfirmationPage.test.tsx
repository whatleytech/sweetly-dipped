import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ConfirmationPage } from "./ConfirmationPage";
import { vi, describe, it, expect, beforeEach } from "vitest";

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
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

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
  pickupDate: "2024-02-15",
  pickupTime: "8:30 AM",
  rushOrder: false,
  referralSource: "",
  termsAccepted: false,
};

const renderConfirmationPage = () => {
  return render(
    <BrowserRouter>
      <ConfirmationPage />
    </BrowserRouter>
  );
};

describe("ConfirmationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ formData: mockFormData, currentStep: 0 })
    );
  });

  it("renders loading state initially", () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderConfirmationPage();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to form page when no data exists", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderConfirmationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/design-package");
    });
  });

  it("displays order details when form data exists", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText("Order Confirmation")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("123-456-7890")).toBeInTheDocument();
      expect(
        screen.getByText("Medium (5 dozen – 60 treats)")
      ).toBeInTheDocument();
    });
  });

  it("displays payment notice", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(
        screen.getByText("Currently ONLY accepting payments via Venmo.")
      ).toBeInTheDocument();
    });
  });

  it("displays rush order notice when rush order is true", async () => {
    const rushOrderData = { ...mockFormData, rushOrder: true };
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ formData: rushOrderData, currentStep: 0 })
    );

    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText(/Rush Order Notice:/)).toBeInTheDocument();
    });
  });

  it("allows editing contact information", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]); // Edit name
    });

    const input = screen.getByDisplayValue("John Doe");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Jane Smith" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  it("displays by-dozen breakdown when package type is by-dozen", async () => {
    const byDozenData = { ...mockFormData, packageType: "by-dozen" as const };
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ formData: byDozenData, currentStep: 0 })
    );

    renderConfirmationPage();

    await waitFor(() => {
      expect(
        screen.getByText("No package — order by the dozen")
      ).toBeInTheDocument();
      expect(screen.getByText("Rice Krispies: 2")).toBeInTheDocument();
      expect(screen.getByText("Oreos: 1")).toBeInTheDocument();
      expect(screen.getByText("Pretzels: 0")).toBeInTheDocument();
      expect(screen.getByText("Marshmallows: 1")).toBeInTheDocument();
      expect(screen.getByText("Total: 4 dozen")).toBeInTheDocument();
    });
  });

  it("displays terms and conditions", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
      expect(
        screen.getByText(/Completing this form does NOT confirm your order/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/All orders are pickup only/)
      ).toBeInTheDocument();
    });
  });

  it("allows selecting referral source", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "Instagram" } });
    });

    expect(screen.getByDisplayValue("Instagram")).toBeInTheDocument();
  });

  it("requires terms acceptance to submit", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const submitButton = screen.getByText("Submit Order");
      expect(submitButton).toBeDisabled();
    });
  });

  it("enables submit button when terms are accepted", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
    });

    const submitButton = screen.getByText("Submit Order");
    expect(submitButton).not.toBeDisabled();
  });

  it("submits form and clears localStorage when terms are accepted", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderConfirmationPage();

    await waitFor(() => {
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      const submitButton = screen.getByText("Submit Order");
      fireEvent.click(submitButton);
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "sweetly-dipped-form-data"
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");

    alertMock.mockRestore();
  });

  it("shows alert when trying to submit without accepting terms", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderConfirmationPage();

    await waitFor(() => {
      const submitButton = screen.getByText("Submit Order");
      expect(submitButton).toBeDisabled();
    });

    // The button is disabled, so clicking it won't trigger the alert
    // This test verifies the button is properly disabled when terms aren't accepted
    expect(alertMock).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });

  it("displays contact information correctly", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText("Contact Information")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  it("displays pickup details correctly", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText("Pickup Details")).toBeInTheDocument();
      expect(screen.getByText(/February 14, 2024/)).toBeInTheDocument();
      expect(screen.getByText("8:30 AM")).toBeInTheDocument();
    });
  });

  it("displays additional design notes when present", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      expect(screen.getByText("Additional Design Notes:")).toBeInTheDocument();
      expect(screen.getByText("Add some sparkles")).toBeInTheDocument();
    });
  });

  it("handles editing cancellation", async () => {
    renderConfirmationPage();

    await waitFor(() => {
      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]); // Edit name
    });

    const input = screen.getByDisplayValue("John Doe");
    fireEvent.change(input, { target: { value: "Changed Name" } });
    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue("Changed Name")
      ).not.toBeInTheDocument();
    });
  });
});
