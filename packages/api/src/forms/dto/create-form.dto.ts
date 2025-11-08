import type { FormData } from '@sweetly-dipped/shared-types';

export interface CreateFormDto {
  formData: FormData;
  currentStep?: number;
}

