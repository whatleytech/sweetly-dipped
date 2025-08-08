import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DesignPackagePage } from "./DesignPackagePage";
import React from "react";

// Mock react-router-dom's useNavigate
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
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("DesignPackagePage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.getItem.mockReturnValue(null); // Start with no saved data
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title and description", () => {
    render(
      <BrowserRouter>
        <DesignPackagePage />
      </BrowserRouter>
    );

    expect(screen.getByText("Design Your Package")).toBeInTheDocument();
    expect(
      screen.getByText("Let's create your perfect chocolate-covered treats!")
    ).toBeInTheDocument();
  });

  it("renders step header with correct step information (7 visible steps by default)", () => {
    render(
      <BrowserRouter>
        <DesignPackagePage />
      </BrowserRouter>
    );

    // Allow for whitespace/newlines between tokens
    expect(screen.getByText(/Step\s*1\s*of\s*7/i)).toBeInTheDocument();
  });

  it("renders the first step (Contact Information)", () => {
    render(
      <BrowserRouter>
        <DesignPackagePage />
      </BrowserRouter>
    );

    expect(screen.getByText("Contact Information")).toBeInTheDocument();
    expect(
      screen.getByText("Let's start with your contact information")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("First Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address *")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number *")).toBeInTheDocument();
  });

  it("saves form data to localStorage when form fields change", async () => {
    render(
      <BrowserRouter>
        <DesignPackagePage />
      </BrowserRouter>
    );

    const firstNameInput = screen.getByLabelText("First Name *");
    fireEvent.change(firstNameInput, { target: { value: "John" } });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Get the last call to setItem
    const lastCall =
      localStorageMock.setItem.mock.calls[
        localStorageMock.setItem.mock.calls.length - 1
      ];
    const savedData = JSON.parse(lastCall[1]);
    expect(savedData.formData.firstName).toBe("John");
  });

  it("loads form data from localStorage on mount", () => {
    const savedData = {
      formData: {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "123-456-7890",
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
      },
      currentStep: 0, // Start at step 1 (index 0)
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

    render(
      <BrowserRouter>
        <DesignPackagePage />
      </BrowserRouter>
    );

    expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123-456-7890")).toBeInTheDocument();
  });

  it("shows sidebar with progress information (7 steps by default)", () => {
    render(
      <BrowserRouter>
        <DesignPackagePage />
      </BrowserRouter>
    );

    expect(screen.getByText("Your Progress")).toBeInTheDocument();
    expect(screen.getByText(/1 of 7 steps completed/)).toBeInTheDocument();
  });
});
