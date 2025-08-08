import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from 'vitest';
import { Navigation } from './Navigation';
import React from 'react';

describe('Navigation', () => {
  it('renders logo and all navigation links', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    // Check logo
    expect(screen.getByRole('link', { name: 'Sweetly Dipped' })).toBeInTheDocument();
    
    // Check navigation links
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Design Your Package" })
    ).toBeInTheDocument();
  });

  it('has correct link destinations', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const aboutLink = screen.getByRole('link', { name: 'About Us' });
    const designPackageLink = screen.getByRole("link", {
      name: "Design Your Package",
    });
    const logoLink = screen.getByRole('link', { name: 'Sweetly Dipped' });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(designPackageLink).toHaveAttribute("href", "/design-package");
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
