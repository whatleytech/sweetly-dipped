import type {
  IStoredFormDto,
  FormDataWithVisitedStepsArray,
} from '@sweetly-dipped/shared-types';

export class StoredFormDto implements IStoredFormDto {
  id!: string;
  formData!: FormDataWithVisitedStepsArray;
  currentStep!: number;
  orderNumber?: string;
  status?: string;
  submittedAt?: string;
  createdAt!: string;
  updatedAt!: string;
}
