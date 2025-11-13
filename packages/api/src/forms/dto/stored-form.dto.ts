import type { FormData } from '@sweetly-dipped/shared-types';

type FormDataWithVisitedStepsArray = Omit<FormData, 'visitedSteps'> & {
  visitedSteps: string[];
};

export interface StoredFormDto {
  id: string;
  formData: FormDataWithVisitedStepsArray;
  currentStep: number;
  orderNumber?: string;
  status?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

