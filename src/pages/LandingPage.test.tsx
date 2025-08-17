 
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LandingPage } from "./LandingPage";

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LandingPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders all landing page sections", () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Check that all section titles are present
    expect(
      screen.getByText("Personalized Chocolate-Covered Treats")
    ).toBeInTheDocument();
    expect(screen.getByText("Our Treats")).toBeInTheDocument();
    expect(screen.getByText("Packages")).toBeInTheDocument();
  });

  it("renders package selection link correctly", () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const packageLink = screen.getByRole("link", {
      name: /packages small 3 dozen \$90 most popular medium 5 dozen \$150 large 8 dozen \$250 xl 12 dozen \$375/i,
    });
    expect(packageLink).toBeInTheDocument();
    expect(packageLink).toHaveAttribute("href", "/design-package");
  });
}); 