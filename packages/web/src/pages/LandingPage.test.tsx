import { screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LandingPage } from "./LandingPage";
import { renderWithQueryClient, setupConfigMocks } from "@/utils/testUtils";
import { configApi } from "@/api/configApi";
import type { PackageOptionDto } from "@sweetly-dipped/shared-types";

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api/configApi", () => ({
  configApi: {
    getPackageOptions: vi.fn(),
  },
}));

describe("LandingPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
    setupConfigMocks(configApi);
    
    // Override with proper structure matching API response
    const mockPackages: PackageOptionDto[] = [
      { id: 'small', label: 'Small', description: '3 dozen – 36 treats', price: 110 },
      { id: 'medium', label: 'Medium', description: '5 dozen – 60 treats', price: 180 },
      { id: 'large', label: 'Large', description: '8 dozen – 96 treats', price: 280 },
      {
        id: 'xl',
        label: 'XL',
        description: '12 dozen – 144 treats (Requires at least one month notice)',
        price: 420,
      },
      { id: 'by-dozen', label: 'By the dozen', description: 'No package — order by the dozen' },
    ];
    vi.mocked(configApi.getPackageOptions).mockResolvedValue(mockPackages);
  });

  it("renders all landing page sections", async () => {
    renderWithQueryClient(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Packages")).toBeInTheDocument();
    });

    // Check that all section titles are present
    expect(
      screen.getByText("Personalized Chocolate-Covered Treats")
    ).toBeInTheDocument();
    expect(screen.getByText("Our Treats")).toBeInTheDocument();
    expect(screen.getByText("Packages")).toBeInTheDocument();
  });

  it("renders package selection link correctly", async () => {
    renderWithQueryClient(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Packages")).toBeInTheDocument();
    });

    // The link contains the packages table, so we check for the link by its href
    const packageLink = screen.getByRole("link", {
      name: /packages/i,
    });
    expect(packageLink).toBeInTheDocument();
    expect(packageLink).toHaveAttribute("href", "/design-package");
  });
}); 