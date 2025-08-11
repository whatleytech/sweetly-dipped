import { render, screen } from "@testing-library/react";
import { RushOrderNotice } from "./RushOrderNotice";
import { describe, it, expect } from "vitest";

describe("RushOrderNotice", () => {
  it("renders rush order notice correctly", () => {
    render(<RushOrderNotice />);

    expect(screen.getByText("Rush Order Notice:")).toBeInTheDocument();
    expect(screen.getByText(/Your selected pickup date is within 2 weeks/)).toBeInTheDocument();
    expect(screen.getByText(/We will reach out to confirm if we are able to fulfill your order/)).toBeInTheDocument();
  });

  it("displays warning icon", () => {
    render(<RushOrderNotice />);

    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });

  it("displays rush order text with strong emphasis", () => {
    render(<RushOrderNotice />);

    const strongText = screen.getByText("Rush Order Notice:");
    expect(strongText).toBeInTheDocument();
    expect(strongText.tagName).toBe("STRONG");
  });

  it("has correct structure with icon and text", () => {
    render(<RushOrderNotice />);

    const container = screen.getByText("Rush Order Notice:").parentElement?.parentElement;
    expect(container?.className).toMatch(/rushNotice/);
    
    const icon = screen.getByText("⚠️");
    expect(icon.className).toMatch(/rushIcon/);
    
    const textContainer = screen.getByText("Rush Order Notice:").parentElement;
    expect(textContainer?.className).toMatch(/rushText/);
  });

  it("renders without any props", () => {
    render(<RushOrderNotice />);

    expect(screen.getByText("Rush Order Notice:")).toBeInTheDocument();
    expect(screen.getByText(/Your selected pickup date is within 2 weeks/)).toBeInTheDocument();
  });

  it("has accessible structure", () => {
    render(<RushOrderNotice />);

    // Check that the notice is visible and readable
    expect(screen.getByText("Rush Order Notice:")).toBeVisible();
    expect(screen.getByText("⚠️")).toBeVisible();
    expect(screen.getByText(/Your selected pickup date is within 2 weeks/)).toBeVisible();
  });

  it("displays complete rush order message", () => {
    render(<RushOrderNotice />);

    expect(screen.getByText("Rush Order Notice:")).toBeInTheDocument();
    expect(screen.getByText(/Your selected pickup date is within 2 weeks/)).toBeInTheDocument();
    expect(screen.getByText(/We will reach out to confirm if we are able to fulfill your order/)).toBeInTheDocument();
  });

  it("has warning styling structure", () => {
    render(<RushOrderNotice />);

    const notice = screen.getByText("Rush Order Notice:").parentElement?.parentElement;
    expect(notice?.className).toMatch(/rushNotice/);
    
    // Check that both icon and text are present
    const icon = screen.getByText("⚠️");
    const text = screen.getByText("Rush Order Notice:");
    expect(icon).toBeInTheDocument();
    expect(text).toBeInTheDocument();
  });
});
