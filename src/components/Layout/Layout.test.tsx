import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders header, main, footer, and children', () => {
    render(
      <Layout>
        <div data-testid="child">Child content</div>
      </Layout>
    );
    expect(screen.getByText(/header/i)).toBeInTheDocument();
    expect(screen.getByText(/footer/i)).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Child content');
  });
});