import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FormData } from '@sweetly-dipped/shared-types';
import type { CreateFormDto } from './dto/create-form.dto.js';
import type { UpdateFormDto } from './dto/update-form.dto.js';
import type { StoredFormDto } from './dto/stored-form.dto.js';

export interface StoredFormData {
  id: string;
  formData: FormData;
  currentStep: number;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

const serializeFormData = (data: StoredFormData): StoredFormDto => ({
  ...data,
  formData: {
    ...data.formData,
    visitedSteps: Array.from(data.formData.visitedSteps),
  },
});

const deserializeFormData = (data: FormData): FormData => {
  const visitedStepsInput = data.visitedSteps;
  let visitedStepsArray: string[] = ['lead'];

  if (Array.isArray(visitedStepsInput)) {
    visitedStepsArray = visitedStepsInput;
  } else if (visitedStepsInput instanceof Set) {
    visitedStepsArray = Array.from(visitedStepsInput);
  }

  return {
    ...data,
    visitedSteps: new Set(visitedStepsArray),
  };
};

@Injectable()
export class FormsService {
  private readonly formDataStore = new Map<string, StoredFormData>();

  create(dto: CreateFormDto): StoredFormDto {
    if (!dto.formData) {
      throw new BadRequestException('Form data is required');
    }

    const id = `form-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const now = new Date().toISOString();
    const currentStep = dto.currentStep ?? 0;

    const storedData: StoredFormData = {
      id,
      formData: deserializeFormData(dto.formData),
      currentStep,
      createdAt: now,
      updatedAt: now,
    };

    this.formDataStore.set(id, storedData);

    return serializeFormData(storedData);
  }

  findAll(): StoredFormDto[] {
    return Array.from(this.formDataStore.values()).map(serializeFormData);
  }

  findOne(id: string): StoredFormDto {
    const data = this.formDataStore.get(id);

    if (!data) {
      throw new NotFoundException('Form data not found');
    }

    return serializeFormData(data);
  }

  update(id: string, dto: UpdateFormDto): StoredFormDto {
    const existingData = this.formDataStore.get(id);

    if (!existingData) {
      throw new NotFoundException('Form data not found');
    }

    const now = new Date().toISOString();

    const updatedData: StoredFormData = {
      ...existingData,
      formData: dto.formData
        ? deserializeFormData(dto.formData)
        : existingData.formData,
      currentStep:
        dto.currentStep !== undefined ? dto.currentStep : existingData.currentStep,
      orderNumber:
        dto.orderNumber !== undefined ? dto.orderNumber : existingData.orderNumber,
      updatedAt: now,
    };

    this.formDataStore.set(id, updatedData);

    return serializeFormData(updatedData);
  }

  remove(id: string): void {
    const deleted = this.formDataStore.delete(id);

    if (!deleted) {
      throw new NotFoundException('Form data not found');
    }
  }
}

