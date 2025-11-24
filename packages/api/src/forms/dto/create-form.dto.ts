import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsInt, Min } from 'class-validator';
import type { ICreateFormDto } from '@sweetly-dipped/shared-types';
import { FormDataDto } from './form-data.dto.js';

export class CreateFormDto implements ICreateFormDto {
  @ValidateNested()
  @Type(() => FormDataDto)
  formData!: FormDataDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStep?: number;
}
