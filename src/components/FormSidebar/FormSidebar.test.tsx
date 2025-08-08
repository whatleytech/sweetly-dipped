import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormSidebar } from './FormSidebar';
import type { FormData } from '../../pages/DesignPackagePage';
import React from 'react';

const mockFormData: FormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  communicationMethod: 'email',
  packageType: 'medium',
  riceKrispies: 2,
  oreos: 1,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: 'Pink and Gold',
  eventType: 'Birthday Party',
  theme: 'Princess',
  additionalDesigns: 'Custom sprinkles',
  pickupDate: '2024-01-15',
  pickupTime: '5:00 PM',
};

const mockFormSteps = [
  { id: 'lead', title: 'Contact Information', component: () => null },
  { id: 'communication', title: 'Communication Preference', component: () => null },
  { id: 'package', title: 'Package Selection', component: () => null },
  { id: 'by-dozen', title: 'By The Dozen', component: () => null },
  { id: 'color', title: 'Color Scheme', component: () => null },
  { id: 'event', title: 'Event Details', component: () => null },
  { id: 'designs', title: 'Additional Designs', component: () => null },
  { id: 'pickup', title: 'Pickup Details', component: () => null },
];

describe('FormSidebar', () => {
  it('renders the sidebar title', () => {
    render(
      <FormSidebar 
        formData={mockFormData}
        currentStep={2}
        formSteps={mockFormSteps}
      />
    );
    
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
  });

  it('renders all form steps with correct status', () => {
    render(
      <FormSidebar 
        formData={mockFormData}
        currentStep={2}
        formSteps={mockFormSteps}
      />
    );
    
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Communication Preference')).toBeInTheDocument();
    expect(screen.getByText('Package Selection')).toBeInTheDocument();
    expect(screen.getByText('By The Dozen')).toBeInTheDocument();
    expect(screen.getByText('Color Scheme')).toBeInTheDocument();
    expect(screen.getByText('Event Details')).toBeInTheDocument();
    expect(screen.getByText('Additional Designs')).toBeInTheDocument();
    expect(screen.getByText('Pickup Details')).toBeInTheDocument();
  });

  it('shows step summaries for completed steps', () => {
    render(
      <FormSidebar 
        formData={mockFormData}
        currentStep={2}
        formSteps={mockFormSteps}
      />
    );
    
    // Contact info summary
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Communication preference summary
    expect(screen.getByText('Email')).toBeInTheDocument();
    
    // Package selection summary
    expect(screen.getByText('Medium Package (5 dozen)')).toBeInTheDocument();
  });

  it('shows by-the-dozen summary when package type is by-dozen', () => {
    const byDozenFormData = {
      ...mockFormData,
      packageType: 'by-dozen' as const,
    };

    render(
      <FormSidebar 
        formData={byDozenFormData}
        currentStep={4}
        formSteps={mockFormSteps}
      />
    );
    
    expect(screen.getByText('2 Rice Krispies, 1 Oreos')).toBeInTheDocument();
  });

  it('shows color scheme summary', () => {
    render(
      <FormSidebar 
        formData={mockFormData}
        currentStep={5}
        formSteps={mockFormSteps}
      />
    );
    
    expect(screen.getByText('Pink and Gold')).toBeInTheDocument();
  });

  it('shows event details summary', () => {
    render(
      <FormSidebar 
        formData={mockFormData}
        currentStep={6}
        formSteps={mockFormSteps}
      />
    );
    
    expect(screen.getByText('Birthday Party, Princess')).toBeInTheDocument();
  });

  it('shows pickup details summary', () => {
    render(
      <FormSidebar 
        formData={mockFormData}
        currentStep={7}
        formSteps={mockFormSteps}
      />
    );
    
    expect(screen.getByText('2024-01-15 at 5:00 PM')).toBeInTheDocument();
  });

  it('displays correct progress information', () => {
    render(
      <FormSidebar 
        formData={mockFormData}
        currentStep={2}
        formSteps={mockFormSteps}
      />
    );
    
    expect(screen.getByText('3 of 8 steps completed')).toBeInTheDocument();
  });

  it('handles empty form data gracefully', () => {
    const emptyFormData: FormData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      communicationMethod: '',
      packageType: '',
      riceKrispies: 0,
      oreos: 0,
      pretzels: 0,
      marshmallows: 0,
      colorScheme: '',
      eventType: '',
      theme: '',
      additionalDesigns: '',
      pickupDate: '',
      pickupTime: '',
    };

    render(
      <FormSidebar 
        formData={emptyFormData}
        currentStep={0}
        formSteps={mockFormSteps}
      />
    );
    
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('1 of 8 steps completed')).toBeInTheDocument();
  });
});
