 
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { Layout } from "./Layout";
import React from "react";

describe("Layout", () => {
  it("renders navigation, main content, and footer", () => {
    render(
      <BrowserRouter>
        <Layout>
          <div data-testid="child">Child content</div>
        </Layout>
      </BrowserRouter>
    );

    // Check navigation elements (now in Navigation component)
    expect(
      screen.getByRole("link", { name: "Sweetly Dipped" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About Us" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Design Your Package" })
    ).toBeInTheDocument();

    // Check footer content
    expect(
      screen.getByText("Website created by Whatley Technologies, LLC")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Website owned by Sweetly Dipped x Jas, LLC")
    ).toBeInTheDocument();

    // Check child content
    expect(screen.getByTestId("child")).toHaveTextContent("Child content");
  });
});
