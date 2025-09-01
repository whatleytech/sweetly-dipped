import { render, screen } from "@testing-library/react";
import { PackageDetails } from "./PackageDetails";
import type { FormData } from '@sweetly-dipped/shared-types';
import { describe, it, expect } from "vitest";

const mockFormData: FormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  communicationMethod: 'email',
  packageType: 'medium',
  riceKrispies: 0,
  oreos: 0,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: 'Pink and Gold',
  eventType: 'Birthday',
  theme: 'Princess',
  additionalDesigns: 'Add some sparkles',
  pickupDate: '2024-02-15',
  pickupTime: '8:30 AM',
  rushOrder: false,
  referralSource: '',
  termsAccepted: false,
  visitedSteps: new Set(),
};

describe("PackageDetails", () => {
  it("renders package type correctly", () => {
    render(<PackageDetails formData={mockFormData} />);
    
    expect(screen.getByText("Package Details")).toBeInTheDocument();
    expect(screen.getByText("Package Type:")).toBeInTheDocument();
    expect(screen.getByText("Medium (5 dozen – 60 treats)")).toBeInTheDocument();
  });

  it("displays correct total for pre-defined package", () => {
    render(<PackageDetails formData={mockFormData} />);
    
    expect(screen.getByText("Total:")).toBeInTheDocument();
    expect(screen.getByText("$180")).toBeInTheDocument();
  });

  it("displays by-dozen breakdown when package type is by-dozen", () => {
    const byDozenData = {
      ...mockFormData,
      packageType: "by-dozen" as const,
      riceKrispies: 2,
      oreos: 1,
      pretzels: 0,
      marshmallows: 1,
    };

    render(<PackageDetails formData={byDozenData} />);
    
    expect(screen.getByText("Treats Breakdown:")).toBeInTheDocument();
    expect(screen.getByText("Rice Krispies: 2")).toBeInTheDocument();
    expect(screen.getByText("Oreos: 1")).toBeInTheDocument();
    expect(screen.getByText("Pretzels: 0")).toBeInTheDocument();
    expect(screen.getByText("Marshmallows: 1")).toBeInTheDocument();
    expect(screen.getByText("Total: 4 dozen")).toBeInTheDocument();
  });

  it("calculates correct total for by-dozen order", () => {
    const byDozenData = {
      ...mockFormData,
      packageType: "by-dozen" as const,
      riceKrispies: 2, // 2 * $40 = $80
      oreos: 1, // 1 * $30 = $30
      pretzels: 0, // 0 * $30 = $0
      marshmallows: 1, // 1 * $40 = $40
    };

    render(<PackageDetails formData={byDozenData} />);

    expect(
      screen.getByText("Deposit due within 48 hours:")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Remainder due 1 week before event:")
    ).toBeInTheDocument();
    expect(screen.getAllByText("$75")).toHaveLength(2);
    // Total: $80 + $30 + $0 + $40 = $150
    expect(screen.getByText("Total:")).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
  });

  it("displays correct totals for different package types", () => {
    const testCases = [
      { packageType: "small", expectedTotal: "$110" },
      { packageType: "medium", expectedTotal: "$180" },
      { packageType: "large", expectedTotal: "$280" },
      { packageType: "xl", expectedTotal: "$420" },
    ];

    testCases.forEach(({ packageType, expectedTotal }) => {
      const testData = {
        ...mockFormData,
        packageType: packageType as FormData["packageType"],
      };

      const { unmount } = render(<PackageDetails formData={testData} />);
      expect(screen.getByText(expectedTotal)).toBeInTheDocument();
      unmount();
    });
  });

  it("handles empty package type gracefully", () => {
    const emptyData = {
      ...mockFormData,
      packageType: "" as const,
    };

    render(<PackageDetails formData={emptyData} />);

    expect(screen.getByText("Package Type:")).toBeInTheDocument();
    expect(screen.getAllByText("$0")).toHaveLength(3);
  });

  it("calculates complex by-dozen order correctly", () => {
    const complexOrder = {
      ...mockFormData,
      packageType: "by-dozen" as const,
      riceKrispies: 3, // 3 * $40 = $120
      oreos: 2,        // 2 * $30 = $60
      pretzels: 1,     // 1 * $30 = $30
      marshmallows: 2, // 2 * $40 = $80
    };

    render(<PackageDetails formData={complexOrder} />);
    
    // Total: $120 + $60 + $30 + $80 = $290
    expect(screen.getByText("$290")).toBeInTheDocument();
    expect(screen.getByText("Total: 8 dozen")).toBeInTheDocument();
  });
});
