import {
  IsString,
  IsEmail,
  IsBoolean,
  IsInt,
  Min,
  IsIn,
  IsDateString,
  IsOptional,
  IsArray,
  Matches,
  ValidateIf,
} from 'class-validator';
import type { FormDataDtoType } from '@sweetly-dipped/shared-types';

export class FormDataDto implements FormDataDtoType {
  // Lead Questions
  @IsOptional()
  @IsString()
  firstName?: string | null;

  @IsOptional()
  @IsString()
  lastName?: string | null;

  @ValidateIf(
    (o) => o.email !== undefined && o.email !== null && o.email !== ''
  )
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ValidateIf(
    (o) => o.phone !== undefined && o.phone !== null && o.phone !== ''
  )
  @IsString()
  @Matches(/^\d{3}-\d{3}-\d{4}$/, {
    message: 'Phone must be in format XXX-XXX-XXXX',
  })
  phone?: string | null;

  // Communication Preference
  @IsOptional()
  @IsIn(['email', 'text', ''])
  communicationMethod?: 'email' | 'text' | '' | null;

  // Package Selection
  @IsOptional()
  @IsIn(['small', 'medium', 'large', 'xl', 'by-dozen', ''])
  packageType?: 'small' | 'medium' | 'large' | 'xl' | 'by-dozen' | '' | null;

  // By The Dozen
  @IsOptional()
  @IsInt()
  @Min(0)
  riceKrispies?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  oreos?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  pretzels?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  marshmallows?: number | null;

  // Design Details
  @IsOptional()
  @IsString()
  colorScheme?: string | null;

  @IsOptional()
  @IsString()
  eventType?: string | null;

  @IsOptional()
  @IsString()
  theme?: string | null;

  @IsOptional()
  @IsArray()
  selectedAdditionalDesigns?: Array<{ id: string; name: string }> | null;

  // Pickup Details
  @ValidateIf(
    (o) =>
      o.pickupDate !== undefined && o.pickupDate !== null && o.pickupDate !== ''
  )
  @IsDateString()
  pickupDate?: string | null;

  @IsOptional()
  @IsString()
  pickupTime?: string | null;

  @IsOptional()
  @IsBoolean()
  rushOrder?: boolean | null;

  // Confirmation Page
  @IsOptional()
  @IsString()
  referralSource?: string | null;

  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean | null;

  // Track visited steps (array instead of Set for DTO)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visitedSteps?: string[] | null;
}
