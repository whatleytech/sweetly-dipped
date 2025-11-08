import type { FormData } from '@sweetly-dipped/shared-types';

export interface UpdateFormDto {
  formData?: FormData;
  currentStep?: number;
  orderNumber?: string;
}

