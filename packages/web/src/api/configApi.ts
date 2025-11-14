import type {
  PackageOptionDto,
  TreatOptionDto,
  TimeSlotsDto,
  UnavailablePeriodDto,
} from '@sweetly-dipped/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchConfig<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/config/${endpoint}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
  }

  return response.json();
}

export const configApi = {
  async getPackageOptions(): Promise<PackageOptionDto[]> {
    return fetchConfig<PackageOptionDto[]>('packages');
  },

  async getTreatOptions(): Promise<TreatOptionDto[]> {
    return fetchConfig<TreatOptionDto[]>('treats');
  },

  async getTimeSlots(): Promise<TimeSlotsDto> {
    return fetchConfig<TimeSlotsDto>('time-slots');
  },

  async getUnavailablePeriods(): Promise<UnavailablePeriodDto[]> {
    return fetchConfig<UnavailablePeriodDto[]>('unavailable-periods');
  },
};


