import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsOptional,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import type { IUpdateFormDto } from '@sweetly-dipped/shared-types';
import { FormDataDto } from './form-data.dto.js';

export class UpdateFormDto implements IUpdateFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FormDataDto)
  formData?: FormDataDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStep?: number;

  @IsOptional()
  @IsString()
  orderNumber?: string;
}
