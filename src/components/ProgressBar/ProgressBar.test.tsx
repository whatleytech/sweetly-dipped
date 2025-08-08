 
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';
import React from 'react';

describe('ProgressBar', () => {
  it('renders step information correctly', () => {
    render(<ProgressBar currentStep={3} totalSteps={8} />);
    
    expect(screen.getByText('Step 3 of 8')).toBeInTheDocument();
    expect(screen.getByText('38% Complete')).toBeInTheDocument();
  });

  it('renders progress bar with correct accessibility attributes', () => {
    render(<ProgressBar currentStep={2} totalSteps={5} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '2');
    expect(progressBar).toHaveAttribute('aria-valuemin', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '5');
    expect(progressBar).toHaveAttribute('aria-label', 'Step 2 of 5');
  });

  it('calculates percentage correctly for different steps', () => {
    const { rerender } = render(<ProgressBar currentStep={1} totalSteps={4} />);
    expect(screen.getByText('25% Complete')).toBeInTheDocument();

    rerender(<ProgressBar currentStep={2} totalSteps={4} />);
    expect(screen.getByText('50% Complete')).toBeInTheDocument();

    rerender(<ProgressBar currentStep={4} totalSteps={4} />);
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
  });

  it('handles edge cases correctly', () => {
    render(<ProgressBar currentStep={0} totalSteps={10} />);
    expect(screen.getByText('0% Complete')).toBeInTheDocument();

    render(<ProgressBar currentStep={1} totalSteps={1} />);
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
  });
});
