 
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PickupDetails } from "./PickupDetails";
import type { FormData } from '@sweetly-dipped/shared-types';
import { renderWithQueryClient, setupConfigMocks } from '@/utils/testUtils';
import { configApi } from '@/api/configApi';

vi.mock('@/api/configApi', () => ({
  configApi: {
    getTimeSlots: vi.fn(),
    getUnavailablePeriods: vi.fn(),
  },
}));

const baseData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  communicationMethod: "",
  packageType: "",
  riceKrispies: 0,
  oreos: 0,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: "",
  eventType: "",
  theme: "",
  selectedAdditionalDesigns: [],
  pickupDate: "",
  pickupTime: "",
  rushOrder: false,
  referralSource: "",
  termsAccepted: false,
  visitedSteps: new Set(),
};

// Helper functions for test dates - using specific available dates
const getAvailableDate = (): string => {
  // Use a date that's definitely not in the unavailable periods and in the future
  // Add 30 days from today to ensure it's in the future
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
};


const getAvailableMondayOrTuesday = (): string => {
  // Use a Monday or Tuesday that has time slots available
  const date = new Date();
  const currentDay = date.getDay();
  // Monday is 1, Tuesday is 2
  let daysToAdd = 0;
  if (currentDay === 0) {
    // Sunday - go to Monday (1 day)
    daysToAdd = 1;
  } else if (currentDay === 1) {
    // Monday - use next Monday (7 days)
    daysToAdd = 7;
  } else if (currentDay === 2) {
    // Tuesday - use next Monday (6 days)
    daysToAdd = 6;
  } else {
    // Wednesday-Saturday - go to next Monday
    daysToAdd = (8 - currentDay) % 7 || 7;
  }
  date.setDate(date.getDate() + daysToAdd + 7); // Add extra week to be safe
  return date.toISOString().split('T')[0];
};

const getRushOrderDate = (): string => {
  // Use a date that's within 2 weeks but not in unavailable periods
  const date = new Date();
  date.setDate(date.getDate() + 10); // 10 days from today (within 2 weeks)
  return date.toISOString().split('T')[0];
};

const getPastDate = (daysAgo: number = 1): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

describe('PickupDetails', () => {
  const updateFormData = vi.fn();
  const onSubmit = vi.fn();
  const onPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setupConfigMocks(configApi);
  });

  it('renders date input and time grid when date is selected', async () => {
    renderWithQueryClient(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Date *')).toBeInTheDocument();
    });

    expect(
      screen.queryByText('Available Pickup Times *')
    ).not.toBeInTheDocument();

    // Time grid should appear after selecting a date
    renderWithQueryClient(
      <PickupDetails
        formData={{ ...baseData, pickupDate: getAvailableDate() }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Available Pickup Times *')).toBeInTheDocument();
    });
  });

  it('shows time grid when date is selected', async () => {
    renderWithQueryClient(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Date *')).toBeInTheDocument();
    });
    expect(
      screen.queryByText('Available Pickup Times *')
    ).not.toBeInTheDocument();

    // Select a date
    const dateInput = screen.getByLabelText('Date *');
    fireEvent.change(dateInput, { target: { value: getAvailableDate() } });

    // Simulate the parent component updating the formData prop
    const updatedFormData = {
      ...baseData,
      pickupDate: getAvailableDate(),
      pickupTime: '',
      rushOrder: false,
    };

    renderWithQueryClient(
      <PickupDetails
        formData={updatedFormData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    // Wait for the component to re-render with the time grid
    await waitFor(() => {
      expect(screen.getByText('Available Pickup Times *')).toBeInTheDocument();
    });
  });

  it('updates form data when date is selected', async () => {
    renderWithQueryClient(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Date *')).toBeInTheDocument();
    });
    const dateInput = screen.getByLabelText('Date *');
    fireEvent.change(dateInput, { target: { value: getAvailableDate() } });

    expect(updateFormData).toHaveBeenCalledWith({
      pickupDate: getAvailableDate(),
      pickupTime: '',
      rushOrder: false,
    });
  });

  it('updates form data when time slot is selected', async () => {
    const data = {
      ...baseData,
      pickupDate: getAvailableMondayOrTuesday(),
    };

    renderWithQueryClient(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Available Pickup Times *')).toBeInTheDocument();
    });
    // Find and click a time slot button
    const timeSlotButtons = screen.getAllByRole('button');
    const timeSlotButton = timeSlotButtons.find((button) =>
      /[0-9]:[0-9]{2} [AP]M/.test(button.textContent || '')
    );
    expect(timeSlotButton).toBeTruthy();
    const timeText = timeSlotButton?.textContent;
    fireEvent.click(timeSlotButton!);

    expect(updateFormData).toHaveBeenCalledWith({ pickupTime: timeText });
  });

  it('shows error message when past date is entered', async () => {
    renderWithQueryClient(
      <PickupDetails
        formData={{ ...baseData, pickupDate: getPastDate() }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Please select a date in the future/)
      ).toBeInTheDocument();
    });
  });

  it('shows rush order message for dates within 2 weeks', async () => {
    // Use a date that's within 2 weeks but not in unavailable periods
    const data = {
      ...baseData,
      pickupDate: getRushOrderDate(),
    };

    renderWithQueryClient(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Rush Order Notice:/)).toBeInTheDocument();
    });
  });

  it('does not show rush order message for dates beyond 2 weeks', async () => {
    // Use a date that's more than 2 weeks away
    const farFutureDate = '2025-12-15';
    const data = {
      ...baseData,
      pickupDate: farFutureDate,
    };

    renderWithQueryClient(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Date *')).toBeInTheDocument();
    });
    expect(screen.queryByText(/Rush Order Notice:/)).not.toBeInTheDocument();
  });

  it('updates rushOrder property when date changes to within 2 weeks', async () => {
    renderWithQueryClient(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Date *')).toBeInTheDocument();
    });
    const dateInput = screen.getByLabelText('Date *');
    fireEvent.change(dateInput, { target: { value: getRushOrderDate() } });

    expect(updateFormData).toHaveBeenCalledWith({
      pickupDate: getRushOrderDate(),
      pickupTime: '',
      rushOrder: true, // Should be true for dates within 2 weeks
    });
  });

  it('updates rushOrder property when date changes to beyond 2 weeks', async () => {
    renderWithQueryClient(
      <PickupDetails
        formData={baseData}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Date *')).toBeInTheDocument();
    });
    const dateInput = screen.getByLabelText('Date *');
    const farFutureDate = '2025-12-15';
    fireEvent.change(dateInput, { target: { value: farFutureDate } });

    expect(updateFormData).toHaveBeenCalledWith({
      pickupDate: farFutureDate,
      pickupTime: '',
      rushOrder: false, // Should be false for dates beyond 2 weeks
    });
  });

  it('enables submit only when date and time are selected', async () => {
    const data = {
      ...baseData,
      pickupDate: getAvailableDate(),
      pickupTime: '5:15 PM',
    };

    renderWithQueryClient(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /submit order/i })
      ).not.toBeDisabled();
    });
  });

  it('calls onPrev and onSubmit appropriately', async () => {
    renderWithQueryClient(
      <PickupDetails
        formData={{
          ...baseData,
          pickupDate: getAvailableDate(),
          pickupTime: '5:15 PM',
        }}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onPrev).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows time slots grouped by windows when date is selected', async () => {
    const data = {
      ...baseData,
      pickupDate: getAvailableMondayOrTuesday(), // Use a date with time slots available
    };

    renderWithQueryClient(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Available Pickup Times *')).toBeInTheDocument();
    });
    // Should show window labels (the actual day depends on what getAvailableFriday() returns)
    const timeWindowLabels = screen.getAllByText(/[0-9]:[0-9]{2} [AP]M/);
    expect(timeWindowLabels.length).toBeGreaterThan(0);

    // Should show time slots for each window
    const timeSlots = screen.getAllByText(/[0-9]:[0-9]{2} [AP]M/);
    expect(timeSlots.length).toBeGreaterThan(0);
  });

  it('handles time slot selection', async () => {
    const data = {
      ...baseData,
      pickupDate: getAvailableMondayOrTuesday(), // Use a date with time slots available
    };

    renderWithQueryClient(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Available Pickup Times *')).toBeInTheDocument();
    });
    // Find time slot buttons specifically (not window labels)
    const timeSlotButtons = screen.getAllByRole('button');
    const timeSlotButton = timeSlotButtons.find((button) =>
      /[0-9]:[0-9]{2} [AP]M/.test(button.textContent || '')
    );
    expect(timeSlotButton).toBeTruthy();
    const timeText = timeSlotButton?.textContent;
    fireEvent.click(timeSlotButton!);

    expect(updateFormData).toHaveBeenCalledWith({ pickupTime: timeText });
  });

  it('shows time slots normally for available dates', async () => {
    const data = {
      ...baseData,
      pickupDate: getAvailableMondayOrTuesday(),
    };

    renderWithQueryClient(
      <PickupDetails
        formData={data}
        updateFormData={updateFormData}
        onNext={vi.fn()}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isFirstStep={false}
        isLastStep={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Available Pickup Times *')).toBeInTheDocument();
    });
    // Should not show unavailable period error
    expect(
      screen.queryByText(/I am unavailable for pickup/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Same-day pickup is not available/)
    ).not.toBeInTheDocument();

    // Should show time slots
    const timeSlots = screen.getAllByText(/[0-9]:[0-9]{2} [AP]M/);
    expect(timeSlots.length).toBeGreaterThan(0);
  });
});
