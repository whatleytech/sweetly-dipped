import { render, screen } from "@testing-library/react";
import { PaymentNotice } from "./PaymentNotice";
import { describe, it, expect } from "vitest";

describe("PaymentNotice", () => {
  it("renders payment notice correctly", () => {
    render(<PaymentNotice />);

    expect(screen.getByText("Currently ONLY accepting payments via Venmo.")).toBeInTheDocument();
  });

  it("displays payment icon", () => {
    render(<PaymentNotice />);

    expect(screen.getByText("💳")).toBeInTheDocument();
  });

  it("displays payment text with strong emphasis", () => {
    render(<PaymentNotice />);

    const strongText = screen.getByText("Currently ONLY accepting payments via Venmo.");
    expect(strongText).toBeInTheDocument();
    expect(strongText.tagName).toBe("STRONG");
  });

  it("has correct structure with icon and text", () => {
    render(<PaymentNotice />);

    const container = screen.getByText("Currently ONLY accepting payments via Venmo.").parentElement?.parentElement;
    expect(container?.className).toMatch(/paymentNotice/);
    
    const icon = screen.getByText("💳");
    expect(icon.className).toMatch(/paymentIcon/);
    
    const textContainer = screen.getByText("Currently ONLY accepting payments via Venmo.").parentElement;
    expect(textContainer?.className).toMatch(/paymentText/);
  });

  it("renders without any props", () => {
    render(<PaymentNotice />);

    expect(screen.getByText("Currently ONLY accepting payments via Venmo.")).toBeInTheDocument();
  });

  it("has accessible structure", () => {
    render(<PaymentNotice />);

    // Check that the notice is visible and readable
    expect(screen.getByText("Currently ONLY accepting payments via Venmo.")).toBeVisible();
    expect(screen.getByText("💳")).toBeVisible();
  });
});
