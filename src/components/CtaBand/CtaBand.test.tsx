import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CtaBand } from './CtaBand';
import React from 'react';

describe('CtaBand', () => {
  it('renders the CTA button with correct text', () => {
    const mockOnStartOrder = vi.fn();
    render(<CtaBand onStartOrder={mockOnStartOrder} />);
    
    const button = screen.getByRole('button', { name: /start building your box/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Start Building Your Box →');
  });

  it('calls onStartOrder when button is clicked', () => {
    const mockOnStartOrder = vi.fn();
    render(<CtaBand onStartOrder={mockOnStartOrder} />);
    
    const button = screen.getByRole('button', { name: /start building your box/i });
    fireEvent.click(button);
    
    expect(mockOnStartOrder).toHaveBeenCalledTimes(1);
  });
}); 