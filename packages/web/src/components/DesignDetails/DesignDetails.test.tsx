import { render, screen } from "@testing-library/react";
import { DesignDetails } from "./DesignDetails";
import type { FormData, AdditionalDesignOptionDto } from '@sweetly-dipped/shared-types';
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as useConfigQuery from "@/hooks/useConfigQuery";

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
  selectedAdditionalDesigns: [],
  pickupDate: '2024-02-15',
  pickupTime: '8:30 AM',
  rushOrder: false,
  referralSource: '',
  termsAccepted: false,
  visitedSteps: new Set(),
};

const mockDesignOptions: AdditionalDesignOptionDto[] = [
  { id: 'design-1', name: 'Sprinkles', basePrice: 10, largePriceIncrease: 0 },
  { id: 'design-2', name: 'Gold or silver painted', basePrice: 15, largePriceIncrease: 5 },
  { id: 'design-3', name: 'Edible images or logos', basePrice: 20, largePriceIncrease: 10 },
];

describe("DesignDetails", () => {
  beforeEach(() => {
    vi.spyOn(useConfigQuery, 'useAdditionalDesignOptions').mockReturnValue({
      data: mockDesignOptions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useConfigQuery.useAdditionalDesignOptions>);
  });
  it("renders design details section correctly", () => {
    render(<DesignDetails formData={mockFormData} />);

    expect(screen.getByText("Design Details")).toBeInTheDocument();
    expect(screen.getByText("Color Scheme:")).toBeInTheDocument();
    expect(screen.getByText("Event Type:")).toBeInTheDocument();
    expect(screen.getByText("Theme:")).toBeInTheDocument();
  });

  it("displays design values correctly", () => {
    render(<DesignDetails formData={mockFormData} />);

    expect(screen.getByText("Pink and Gold")).toBeInTheDocument();
    expect(screen.getByText("Birthday")).toBeInTheDocument();
    expect(screen.getByText("Princess")).toBeInTheDocument();
  });

  it("displays selected additional designs when present", () => {
    const formDataWithDesigns = {
      ...mockFormData,
      selectedAdditionalDesigns: ['design-1', 'design-2'],
    };
    render(<DesignDetails formData={formDataWithDesigns} />);

    expect(screen.getByText("Additional Designs:")).toBeInTheDocument();
    expect(screen.getByText("Sprinkles, Gold or silver painted")).toBeInTheDocument();
  });

  it("does not display additional designs when empty", () => {
    const emptyDesignsData = { ...mockFormData, selectedAdditionalDesigns: [] };
    render(<DesignDetails formData={emptyDesignsData} />);

    expect(screen.queryByText("Additional Designs:")).not.toBeInTheDocument();
  });

  it("maps selected design IDs to names correctly", () => {
    const formDataWithDesigns = {
      ...mockFormData,
      selectedAdditionalDesigns: ['design-3'],
    };
    render(<DesignDetails formData={formDataWithDesigns} />);

    expect(screen.getByText("Additional Designs:")).toBeInTheDocument();
    expect(screen.getByText("Edible images or logos")).toBeInTheDocument();
  });

  it("displays not specified for empty color scheme", () => {
    const emptyColorData = { ...mockFormData, colorScheme: "" };
    render(<DesignDetails formData={emptyColorData} />);

    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  it("displays not specified for empty event type", () => {
    const emptyEventData = { ...mockFormData, eventType: "" };
    render(<DesignDetails formData={emptyEventData} />);

    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  it("displays not specified for empty theme", () => {
    const emptyThemeData = { ...mockFormData, theme: "" };
    render(<DesignDetails formData={emptyThemeData} />);

    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  it("handles all empty design fields", () => {
    const emptyData = {
      ...mockFormData,
      colorScheme: "",
      eventType: "",
      theme: "",
      selectedAdditionalDesigns: [],
    };
    render(<DesignDetails formData={emptyData} />);

    const notSpecifiedElements = screen.getAllByText("Not specified");
    expect(notSpecifiedElements).toHaveLength(3);
    expect(screen.queryByText("Additional Designs:")).not.toBeInTheDocument();
  });
});
