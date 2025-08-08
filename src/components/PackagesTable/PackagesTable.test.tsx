 
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PackagesTable } from './PackagesTable';


describe('PackagesTable', () => {
  it('renders all packages with correct information', () => {
    render(<PackagesTable />);
    
    // Check section title
    expect(screen.getByText('Packages')).toBeInTheDocument();
    
    // Check all package names
    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
    expect(screen.getByText('XL')).toBeInTheDocument();
    
    // Check quantities
    expect(screen.getByText('3 dozen')).toBeInTheDocument();
    expect(screen.getByText('5 dozen')).toBeInTheDocument();
    expect(screen.getByText('8 dozen')).toBeInTheDocument();
    expect(screen.getByText('12 dozen')).toBeInTheDocument();
    
    // Check prices
    expect(screen.getByText('$90')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.getByText('$250')).toBeInTheDocument();
    expect(screen.getByText('$375')).toBeInTheDocument();
  });

  it('marks Medium package as most popular', () => {
    render(<PackagesTable />);
    
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
    
    // Verify it's associated with the Medium package
    const mediumPackage = screen.getByText('Medium').closest('div');
    const popularBadge = screen.getByText('Most Popular');
    expect(mediumPackage).toContainElement(popularBadge);
  });
}); 