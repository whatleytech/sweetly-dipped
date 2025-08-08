 
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from './HeroSection';
import React from 'react';

describe('HeroSection', () => {
  it("renders headline, subcopy, and logo", () => {
    render(<HeroSection />);

    expect(
      screen.getByText("Personalized Chocolate-Covered Treats")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Elevate your next event with handcrafted indulgence.")
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(
        "Sweetly Dipped by Jas logo - chocolate dripping design with pink text"
      )
    ).toBeInTheDocument();
  });

  it('has correct heading structure', () => {
    render(<HeroSection />);
    
    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent('Personalized Chocolate-Covered Treats');
  });
}); 