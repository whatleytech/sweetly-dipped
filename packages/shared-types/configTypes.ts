import type { Time, DayOfWeek } from './formTypes';

export interface TimeSlotDto {
  startTime: Time;
  endTime: Time;
}

export type TimeSlotsDto = {
  [key in DayOfWeek]: TimeSlotDto[];
};

// Package type values (without empty string for DTOs)
export type PackageId = 'small' | 'medium' | 'large' | 'xl' | 'by-dozen';

export interface PackageOptionDto {
  id: PackageId; // Maps from packageId - must match FormData.packageType (without empty string)
  label: string;
  description?: string;
  price?: number;
}

// Treat key values - must match FormData field names
export type TreatKey = 'riceKrispies' | 'oreos' | 'pretzels' | 'marshmallows';

export interface TreatOptionDto {
  key: TreatKey; // Maps from treatKey - must match FormData field names
  label: string;
  price: number;
}

export interface UnavailablePeriodDto {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate?: string; // ISO date string (YYYY-MM-DD) - optional for single-day unavailability
  reason?: string; // Optional reason for unavailability
}

