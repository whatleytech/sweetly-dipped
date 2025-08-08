import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LandingPage } from './LandingPage';
import React from 'react';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage', () => {
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

  it("renders CTA button and handles click", () => {
    // Mock console.log to verify it's called
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const ctaButton = screen.getByRole("button", {
      name: /start designing your package/i,
    });
    expect(ctaButton).toBeInTheDocument();

    fireEvent.click(ctaButton);
    expect(consoleSpy).toHaveBeenCalledWith("Start order clicked");
    expect(mockNavigate).toHaveBeenCalledWith("/design-package");

    consoleSpy.mockRestore();
  });
}); 