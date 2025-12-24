import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FormData } from '@sweetly-dipped/shared-types';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/index.js';
import type { CreateFormDto } from './dto/create-form.dto.js';
import type { UpdateFormDto } from './dto/update-form.dto.js';
import type { StoredFormDto } from './dto/stored-form.dto.js';
import type { SubmitFormDto } from './dto/submit-form.dto.js';
import { FormDataDto } from './dto/form-data.dto.js';

const DEFAULT_VISITED_STEP = 'lead';
const COMMUNICATION_METHODS: ReadonlyArray<FormData['communicationMethod']> = [
  '',
  'email',
  'text',
] as const;
const PACKAGE_TYPES: ReadonlyArray<FormData['packageType']> = [
  '',
  'small',
  'medium',
  'large',
  'xl',
  'by-dozen',
] as const;

type FormWithRelations = Prisma.FormGetPayload<{
  include: { customer: true; order: true };
}>;

const ensureVisitedStepsSet = (
  input: FormData['visitedSteps'] | string[] | null | undefined
): Set<string> => {
  if (input instanceof Set) {
    const steps = input.size > 0 ? input : new Set<string>();
    if (steps.size === 0) {
      steps.add(DEFAULT_VISITED_STEP);
    }
    return steps;
  }

  const steps = new Set<string>();
  if (Array.isArray(input)) {
    for (const step of input) {
      if (typeof step === 'string' && step.trim()) {
        steps.add(step);
      }
    }
  }
  if (steps.size === 0) {
    steps.add(DEFAULT_VISITED_STEP);
  }
  return steps;
};

const normalizeFormDataInput = (data: FormDataDto): FormData => ({
  firstName: data.firstName ?? '',
  lastName: data.lastName ?? '',
  email: data.email ?? '',
  phone: data.phone ?? '',
  communicationMethod: (data.communicationMethod ??
    '') as FormData['communicationMethod'],
  packageType: (data.packageType ?? '') as FormData['packageType'],
  riceKrispies: data.riceKrispies ?? 0,
  oreos: data.oreos ?? 0,
  pretzels: data.pretzels ?? 0,
  marshmallows: data.marshmallows ?? 0,
  colorScheme: data.colorScheme ?? '',
  eventType: data.eventType ?? '',
  theme: data.theme ?? '',
  additionalDesigns: data.additionalDesigns ?? '',
  selectedAdditionalDesigns: Array.isArray(data.selectedAdditionalDesigns)
    ? data.selectedAdditionalDesigns.filter((id): id is string => typeof id === 'string')
    : [],
  pickupDate: data.pickupDate ?? '',
  pickupTime: data.pickupTime ?? '',
  rushOrder: data.rushOrder ?? false,
  referralSource: data.referralSource ?? '',
  termsAccepted: data.termsAccepted ?? false,
  visitedSteps: ensureVisitedStepsSet(data.visitedSteps),
});

const toNullableString = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isJsonObject = (value: Prisma.JsonValue): value is Prisma.JsonObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

interface FormMetadata {
  colorScheme: string;
  eventType: string;
  theme: string;
  additionalDesigns: string; // Keep for now
  selectedAdditionalDesigns: string[];
  termsAccepted: boolean;
  visitedSteps: string[];
  currentStep: number;
}

const getFormMetadata = (form: FormWithRelations): FormMetadata => {
  const json = isJsonObject(form.data) ? form.data : {};

  const toStringField = (value: Prisma.JsonValue | undefined): string =>
    typeof value === 'string' ? value : '';

  const toBooleanField = (value: Prisma.JsonValue | undefined): boolean =>
    typeof value === 'boolean' ? value : false;

  const toVisitedSteps = (value: Prisma.JsonValue | undefined): string[] => {
    if (Array.isArray(value)) {
      const steps = value.filter(
        (step): step is string =>
          typeof step === 'string' && step.trim().length > 0
      );
      return steps.length > 0
        ? Array.from(new Set(steps))
        : [DEFAULT_VISITED_STEP];
    }
    return [DEFAULT_VISITED_STEP];
  };

  const toCurrentStep = (value: Prisma.JsonValue | undefined): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : 0;

  const toArrayField = (value: Prisma.JsonValue | undefined): string[] => {
    if (Array.isArray(value)) {
      return value.filter((v): v is string => typeof v === 'string');
    }
    return [];
  };

  return {
    colorScheme: toStringField(json.colorScheme),
    eventType: toStringField(json.eventType),
    theme: toStringField(json.theme),
    additionalDesigns: toStringField(json.additionalDesigns),
    selectedAdditionalDesigns: toArrayField(json.selectedAdditionalDesigns),
    termsAccepted: toBooleanField(json.termsAccepted),
    visitedSteps: toVisitedSteps(json.visitedSteps),
    currentStep: toCurrentStep(json.currentStep),
  };
};

const buildJsonData = (
  formData: FormData,
  currentStep: number
): Prisma.InputJsonObject => ({
  colorScheme: formData.colorScheme,
  eventType: formData.eventType,
  theme: formData.theme,
  additionalDesigns: formData.additionalDesigns, // Keep for backward compat
  selectedAdditionalDesigns: formData.selectedAdditionalDesigns,
  termsAccepted: formData.termsAccepted,
  visitedSteps: Array.from(formData.visitedSteps),
  currentStep,
});

const sanitizeCommunicationMethod = (
  value: string | null | undefined
): FormData['communicationMethod'] =>
  COMMUNICATION_METHODS.includes(value as FormData['communicationMethod'])
    ? (value as FormData['communicationMethod'])
    : '';

const sanitizePackageType = (
  value: string | null | undefined
): FormData['packageType'] =>
  PACKAGE_TYPES.includes(value as FormData['packageType'])
    ? (value as FormData['packageType'])
    : '';

const mapSharedFormFields = (formData: FormData, currentStep: number) => ({
  communicationMethod: toNullableString(formData.communicationMethod),
  pickupDate: toNullableString(formData.pickupDate),
  pickupTime: toNullableString(formData.pickupTime),
  rushOrder: formData.rushOrder,
  packageType: toNullableString(formData.packageType),
  riceKrispies: formData.riceKrispies,
  oreos: formData.oreos,
  pretzels: formData.pretzels,
  marshmallows: formData.marshmallows,
  referralSource: toNullableString(formData.referralSource),
  data: buildJsonData(formData, currentStep),
});

const toFormDataFromRecord = (form: FormWithRelations): FormData => {
  const metadata = getFormMetadata(form);
  const visitedSteps = ensureVisitedStepsSet(metadata.visitedSteps);

  return {
    firstName: form.customer?.firstName ?? '',
    lastName: form.customer?.lastName ?? '',
    email: form.customer?.email ?? '',
    phone: form.customer?.phone ?? '',
    communicationMethod: sanitizeCommunicationMethod(form.communicationMethod),
    packageType: sanitizePackageType(form.packageType),
    riceKrispies: form.riceKrispies,
    oreos: form.oreos,
    pretzels: form.pretzels,
    marshmallows: form.marshmallows,
    colorScheme: metadata.colorScheme,
    eventType: metadata.eventType,
    theme: metadata.theme,
    additionalDesigns: metadata.additionalDesigns,
    selectedAdditionalDesigns: metadata.selectedAdditionalDesigns,
    pickupDate: form.pickupDate ?? '',
    pickupTime: form.pickupTime ?? '',
    rushOrder: form.rushOrder,
    referralSource: form.referralSource ?? '',
    termsAccepted: metadata.termsAccepted,
    visitedSteps,
  };
};

const generateOrderNumber = (): string => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0].replace(/-/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const hash = Array.from({ length: 12 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  return `${dateString}-${hash}`;
};

const mapFormToStoredDto = (form: FormWithRelations): StoredFormDto => {
  const formData = toFormDataFromRecord(form);
  const metadata = getFormMetadata(form);
  const { visitedSteps, ...formDataRest } = formData;

  return {
    id: form.id,
    formData: {
      ...formDataRest,
      visitedSteps: Array.from(visitedSteps),
    },
    currentStep: metadata.currentStep,
    orderNumber: form.order?.orderNumber ?? undefined,
    status: form.status,
    submittedAt: form.submittedAt?.toISOString(),
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
  };
};

@Injectable()
export class FormsService {
  private readonly formInclude = { customer: true, order: true } as const;

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFormDto): Promise<StoredFormDto> {
    if (!dto.formData) {
      throw new BadRequestException('Form data is required');
    }

    const currentStep = dto.currentStep ?? 0;
    const normalizedFormData = normalizeFormDataInput(dto.formData);
    const trimmedEmail = normalizedFormData.email.trim();

    const customer = trimmedEmail
      ? await this.prisma.customer.upsert({
          where: { email: trimmedEmail },
          update: {
            firstName: normalizedFormData.firstName,
            lastName: normalizedFormData.lastName,
            phone: normalizedFormData.phone,
          },
          create: {
            firstName: normalizedFormData.firstName,
            lastName: normalizedFormData.lastName,
            email: trimmedEmail,
            phone: normalizedFormData.phone,
          },
        })
      : null;

    const form = await this.prisma.form.create({
      data: {
        ...mapSharedFormFields(normalizedFormData, currentStep),
        customer: customer
          ? {
              connect: { id: customer.id },
            }
          : undefined,
      },
      include: this.formInclude,
    });

    return mapFormToStoredDto(form);
  }

  async findAll(): Promise<StoredFormDto[]> {
    const forms = await this.prisma.form.findMany({
      include: this.formInclude,
      orderBy: { createdAt: 'desc' },
    });

    return forms.map(mapFormToStoredDto);
  }

  async findOne(id: string): Promise<StoredFormDto> {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: this.formInclude,
    });

    if (!form) {
      throw new NotFoundException('Form data not found');
    }

    return mapFormToStoredDto(form);
  }

  async update(id: string, dto: UpdateFormDto): Promise<StoredFormDto> {
    const existingForm = await this.prisma.form.findUnique({
      where: { id },
      include: this.formInclude,
    });

    if (!existingForm) {
      throw new NotFoundException('Form data not found');
    }

    const existingFormData = toFormDataFromRecord(existingForm);
    const targetFormData = dto.formData
      ? normalizeFormDataInput(dto.formData)
      : existingFormData;
    const targetStep =
      dto.currentStep ?? getFormMetadata(existingForm).currentStep;

    const trimmedEmail = targetFormData.email.trim();
    let customer = existingForm.customer;

    if (dto.formData) {
      customer = trimmedEmail
        ? await this.prisma.customer.upsert({
            where: { email: trimmedEmail },
            update: {
              firstName: targetFormData.firstName,
              lastName: targetFormData.lastName,
              phone: targetFormData.phone,
            },
            create: {
              firstName: targetFormData.firstName,
              lastName: targetFormData.lastName,
              email: trimmedEmail,
              phone: targetFormData.phone,
            },
          })
        : null;
    }

    const formUpdateData: Prisma.FormUpdateInput = dto.formData
      ? {
          ...mapSharedFormFields(targetFormData, targetStep),
          ...(customer
            ? { customer: { connect: { id: customer.id } } }
            : existingForm.customer
              ? { customer: { disconnect: true } }
              : {}),
        }
      : {
          data: buildJsonData(targetFormData, targetStep),
        };

    await this.prisma.form.update({
      where: { id },
      data: formUpdateData,
    });

    if (dto.orderNumber !== undefined) {
      if (dto.orderNumber && customer) {
        await this.prisma.order.upsert({
          where: { formId: id },
          update: {
            orderNumber: dto.orderNumber,
            customerId: customer.id,
          },
          create: {
            orderNumber: dto.orderNumber,
            formId: id,
            customerId: customer.id,
          },
        });
      } else {
        await this.prisma.order.deleteMany({
          where: { formId: id },
        });
      }
    }

    const updatedForm = await this.prisma.form.findUnique({
      where: { id },
      include: this.formInclude,
    });

    if (!updatedForm) {
      throw new NotFoundException('Form data not found');
    }

    return mapFormToStoredDto(updatedForm);
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.form.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Form data not found');
      }
      throw error;
    }
  }

  async submit(id: string): Promise<SubmitFormDto> {
    // 1. Fetch form with customer/order relations
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: this.formInclude,
    });

    if (!form) {
      throw new NotFoundException('Form data not found');
    }

    // 2. Validate form is in draft status
    if (form.status !== 'draft') {
      throw new BadRequestException(
        `Form is already submitted. Current status: ${form.status}`
      );
    }

    // 3. Validate customer exists (throw BadRequestException if not)
    if (!form.customer) {
      throw new BadRequestException(
        'Cannot submit form without customer information'
      );
    }

    // 4. Generate order number with random hash
    const orderNumber = generateOrderNumber();
    const submittedAt = new Date();

    // 5. Update form status to "submitted" with submittedAt timestamp and create order record
    await this.prisma.form.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt,
        order: {
          create: {
            orderNumber,
            customerId: form.customer.id,
          },
        },
      },
    });

    // 6. Return order details
    return {
      orderNumber,
      submittedAt: submittedAt.toISOString(),
    };
  }
}

