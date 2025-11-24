import type { FormData } from './formTypes.js';

// Stored form uses array instead of Set for serialization
export type FormDataWithVisitedStepsArray = Omit<FormData, 'visitedSteps'> & {
  visitedSteps: string[];
};

// DTO type derived from FormData - all properties optional/nullable, visitedSteps as array
export type FormDataDtoType = {
  [K in keyof Omit<FormData, 'visitedSteps'>]?: FormData[K] | null;
} & {
  visitedSteps?: string[] | null;
};

export interface ICreateFormDto {
  formData: FormDataDtoType;
  currentStep?: number;
}

export interface IUpdateFormDto {
  formData?: FormDataDtoType;
  currentStep?: number;
  orderNumber?: string;
}

export interface IStoredFormDto {
  id: string;
  formData: FormDataWithVisitedStepsArray;
  currentStep: number;
  orderNumber?: string;
  status?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubmitFormDto {
  orderNumber: string;
  submittedAt: string;
}

