 
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TreatsGrid } from './TreatsGrid';


describe('TreatsGrid', () => {
  it('renders all four treats with names and descriptions', () => {
    render(<TreatsGrid />);
    
    // Check section title
    expect(screen.getByText('Our Treats')).toBeInTheDocument();
    
    // Check all treat names
    expect(screen.getByText('Pretzels')).toBeInTheDocument();
    expect(screen.getByText('Oreos')).toBeInTheDocument();
    expect(screen.getByText('Marshmallows')).toBeInTheDocument();
    expect(screen.getByText('Rice Krispies')).toBeInTheDocument();
    
    // Check descriptions
    expect(screen.getByText(/Crunchy pretzels dipped in rich chocolate/)).toBeInTheDocument();
    expect(screen.getByText(/Classic Oreo cookies enrobed in smooth chocolate/)).toBeInTheDocument();
    expect(screen.getByText(/Fluffy marshmallows dipped in premium chocolate/)).toBeInTheDocument();
    expect(screen.getByText(/Crispy rice cereal treats covered in chocolate/)).toBeInTheDocument();
  });

  it('renders images for all treats', () => {
    render(<TreatsGrid />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
    
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt');
      expect((img as HTMLImageElement).alt).toContain('Chocolate covered');
    });
  });
}); 