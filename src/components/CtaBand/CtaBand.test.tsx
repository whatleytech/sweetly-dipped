import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CtaBand } from './CtaBand';
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

describe('CtaBand', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders CTA button", () => {
    render(
      <BrowserRouter>
        <CtaBand />
      </BrowserRouter>
    );

    const button = screen.getByRole("button", {
      name: /start building your box/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("navigates to build-box page when clicked", () => {
    render(
      <BrowserRouter>
        <CtaBand />
      </BrowserRouter>
    );

    const button = screen.getByRole("button", {
      name: /start building your box/i,
    });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/build-box");
  });

  it("calls onStartOrder callback if provided", () => {
    const mockCallback = vi.fn();

    render(
      <BrowserRouter>
        <CtaBand onStartOrder={mockCallback} />
      </BrowserRouter>
    );

    const button = screen.getByRole("button", {
      name: /start building your box/i,
    });
    fireEvent.click(button);

    expect(mockCallback).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/build-box");
  });
}); 