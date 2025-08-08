import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LandingPage } from './LandingPage';
import React from 'react';

describe('LandingPage', () => {
  it('renders all landing page sections', () => {
    render(<LandingPage />);
    
    // Check that all section titles are present
    expect(screen.getByText('Personalized Chocolate-Covered Treats')).toBeInTheDocument();
    expect(screen.getByText('Our Treats')).toBeInTheDocument();
    expect(screen.getByText('Packages')).toBeInTheDocument();
    
    // Check footer content
    expect(screen.getByText('Sweetly Dipped')).toBeInTheDocument();
    expect(screen.getByText('Website created by Whatley Technologies, LLC')).toBeInTheDocument();
    expect(screen.getByText('Website owned by Sweetly Dipped x Jas, LLC')).toBeInTheDocument();
  });

  it('renders CTA button and handles click', () => {
    // Mock console.log to verify it's called
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<LandingPage />);
    
    const ctaButton = screen.getByRole('button', { name: /start building your box/i });
    expect(ctaButton).toBeInTheDocument();
    
    fireEvent.click(ctaButton);
    expect(consoleSpy).toHaveBeenCalledWith('Start order clicked');
    
    consoleSpy.mockRestore();
  });

  it('renders Instagram link in footer', () => {
    render(<LandingPage />);
    
    const instagramLink = screen.getByLabelText('Follow Sweetly Dipped on Instagram');
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/sweetlydippedxjas');
  });
}); 