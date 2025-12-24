import { Controller, Get } from '@nestjs/common';
import type {
  PackageOptionDto,
  TreatOptionDto,
  TimeSlotsDto,
  UnavailablePeriodDto,
  AdditionalDesignOptionDto,
} from '@sweetly-dipped/shared-types';
import { ConfigService } from './config.service.js';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('packages')
  async getPackages(): Promise<PackageOptionDto[]> {
    return this.configService.getPackageOptions();
  }

  @Get('treats')
  async getTreats(): Promise<TreatOptionDto[]> {
    return this.configService.getTreatOptions();
  }

  @Get('time-slots')
  async getTimeSlots(): Promise<TimeSlotsDto> {
    return this.configService.getTimeSlots();
  }

  @Get('unavailable-periods')
  async getUnavailablePeriods(): Promise<UnavailablePeriodDto[]> {
    return this.configService.getUnavailablePeriods();
  }

  @Get('additional-designs')
  async getAdditionalDesigns(): Promise<AdditionalDesignOptionDto[]> {
    return this.configService.getAdditionalDesignOptions();
  }
}


