import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';
import React from 'react';

describe('Footer', () => {
  it('renders logo, copyright, and social links', () => {
    render(<Footer />);
    
    // Check logo
    expect(screen.getByText('Sweetly Dipped')).toBeInTheDocument();
    
    // Check copyright with current year
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Sweetly Dipped. All rights reserved.`)).toBeInTheDocument();
    
    // Check social links
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
  });

  it('has correct heading structure', () => {
    render(<Footer />);
    
    const logo = screen.getByRole('heading', { level: 3 });
    expect(logo).toHaveTextContent('Sweetly Dipped');
  });
}); 