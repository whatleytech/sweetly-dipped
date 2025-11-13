import { Injectable } from '@nestjs/common';
import type {
  PackageOptionDto,
  TreatOptionDto,
  TimeSlotsDto,
  UnavailablePeriodDto,
  DayOfWeek,
  PackageId,
  TreatKey,
} from '@sweetly-dipped/shared-types';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getPackageOptions(): Promise<PackageOptionDto[]> {
    const options = await this.prisma.packageOption.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return options.map((option) => ({
      id: option.packageId as PackageId,
      label: option.label,
      description: option.description ?? undefined,
      price: option.price ?? undefined,
    }));
  }

  async getTreatOptions(): Promise<TreatOptionDto[]> {
    const options = await this.prisma.treatOption.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return options.map((option) => ({
      key: option.treatKey as TreatKey,
      label: option.label,
      price: option.price,
    }));
  }

  async getTimeSlots(): Promise<TimeSlotsDto> {
    const slots = await this.prisma.timeSlot.findMany({
      where: { isActive: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startHour: 'asc' }, { startMinute: 'asc' }],
    });

    const grouped: Partial<TimeSlotsDto> = {};

    for (const slot of slots) {
      const day = slot.dayOfWeek as DayOfWeek;
      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day]!.push({
        startTime: {
          hour: slot.startHour,
          minute: slot.startMinute,
          timeOfDay: slot.startTimeOfDay as 'morning' | 'evening',
        },
        endTime: {
          hour: slot.endHour,
          minute: slot.endMinute,
          timeOfDay: slot.endTimeOfDay as 'morning' | 'evening',
        },
      });
    }

    // Ensure all days are present with empty arrays
    const days: DayOfWeek[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const result: TimeSlotsDto = {} as TimeSlotsDto;
    for (const day of days) {
      result[day] = grouped[day] ?? [];
    }

    return result;
  }

  async getUnavailablePeriods(): Promise<UnavailablePeriodDto[]> {
    const periods = await this.prisma.unavailablePeriod.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'asc' },
    });

    return periods.map((period) => ({
      startDate: period.startDate,
      endDate: period.endDate ?? undefined,
      reason: period.reason ?? undefined,
    }));
  }
}

