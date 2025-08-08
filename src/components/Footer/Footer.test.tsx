 
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';


describe('Footer', () => {
  it("renders logo, copyright, company info, and Instagram link", () => {
    render(<Footer />);

    // Check logo
    expect(screen.getByText("Sweetly Dipped")).toBeInTheDocument();

    // Check copyright with current year and updated company name
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(
        `© ${currentYear} Sweetly Dipped x Jas, LLC. All rights reserved.`
      )
    ).toBeInTheDocument();

    // Check company information
    expect(
      screen.getByText("Website owned by Sweetly Dipped x Jas, LLC")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Website created by Whatley Technologies, LLC")
    ).toBeInTheDocument();

    // Check Instagram link
    const instagramLink = screen.getByLabelText(
      "Follow Sweetly Dipped on Instagram"
    );
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute(
      "href",
      "https://www.instagram.com/sweetlydippedxjas"
    );
    expect(instagramLink).toHaveAttribute("target", "_blank");
    expect(instagramLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it('has correct heading structure', () => {
    render(<Footer />);
    
    const logo = screen.getByRole('heading', { level: 3 });
    expect(logo).toHaveTextContent('Sweetly Dipped');
  });
}); 