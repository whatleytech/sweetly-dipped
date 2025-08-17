 
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from './HeroSection';


describe('HeroSection', () => {
  it("renders headline, subcopy, and logo", () => {
    render(<HeroSection />);

    expect(
      screen.getByText("Personalized Chocolate-Covered Treats")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sweetly Made, Perfectly Dipped")
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

  it('renders background video with proper attributes', () => {
    const { container } = render(<HeroSection />);
    
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveClass('_backgroundVideo_aa8e4d');
    expect(video).toHaveAttribute('aria-hidden', 'true');
    expect(video).toHaveAttribute('src');
  });
}); 