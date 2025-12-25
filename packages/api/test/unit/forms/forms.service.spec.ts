import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { FormsService } from '../../../src/forms/forms.service.js';
import { PrismaService } from '../../../src/prisma/prisma.service.js';
import { Prisma } from '../../../generated/prisma/index.js';
import type { CreateFormDto } from '../../../src/forms/dto/create-form.dto.js';

describe('FormsService', () => {
  let service: FormsService;
  let prisma: ReturnType<typeof mockDeep<PrismaService>>;

  beforeEach(() => {
    prisma = mockDeep<PrismaService>();
    service = new FormsService(prisma);
  });

  const createMockFormData = () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    communicationMethod: 'email' as const,
    packageType: 'medium' as const,
    riceKrispies: faker.number.int({ min: 0, max: 10 }),
    oreos: faker.number.int({ min: 0, max: 10 }),
    pretzels: faker.number.int({ min: 0, max: 10 }),
    marshmallows: faker.number.int({ min: 0, max: 10 }),
    colorScheme: faker.color.human(),
    eventType: faker.word.noun(),
    theme: faker.word.adjective(),
    selectedAdditionalDesigns: [],
    pickupDate: faker.date.future().toISOString().split('T')[0],
    pickupTime: '10:00 AM',
    rushOrder: false,
    referralSource: faker.word.noun(),
    termsAccepted: true,
    visitedSteps: ['lead', 'communication', 'package'],
  });

  const createMockForm = (overrides?: Partial<Prisma.FormGetPayload<{ include: { customer: true; order: true } }>>) => {
    const formData = createMockFormData();
    const formId = faker.string.uuid();
    const customerId = faker.string.uuid();
    const createdAt = faker.date.past();
    const updatedAt = faker.date.recent();

    return {
      id: formId,
      customerId,
      communicationMethod: formData.communicationMethod,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      rushOrder: formData.rushOrder,
      packageType: formData.packageType,
      riceKrispies: formData.riceKrispies,
      oreos: formData.oreos,
      pretzels: formData.pretzels,
      marshmallows: formData.marshmallows,
      referralSource: formData.referralSource,
      status: 'draft' as const,
      submittedAt: null,
      data: {
        colorScheme: formData.colorScheme,
        eventType: formData.eventType,
        theme: formData.theme,
        selectedAdditionalDesigns: formData.selectedAdditionalDesigns,
        termsAccepted: formData.termsAccepted,
        visitedSteps: formData.visitedSteps,
        currentStep: 2,
      },
      createdAt,
      updatedAt,
      customer: {
        id: customerId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        createdAt,
        updatedAt,
      },
      order: null,
      ...overrides,
    };
  };

  describe('create', () => {
    it('should create a form with customer', async () => {
      // Arrange
      const formData = createMockFormData();
      const createDto = { formData, currentStep: 2 };
      const mockCustomer = {
        id: faker.string.uuid(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockForm = createMockForm({
        customer: mockCustomer,
        customerId: mockCustomer.id,
      });

      prisma.customer.upsert.mockResolvedValue(mockCustomer);
      prisma.form.create.mockResolvedValue(mockForm);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(prisma.customer.upsert).toHaveBeenCalledWith({
        where: { email: formData.email.trim() },
        update: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
        create: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email.trim(),
          phone: formData.phone,
        },
      });
      expect(result).toHaveProperty('id');
      expect(result.formData.email).toBe(formData.email);
    });

    it('should throw BadRequestException when formData is missing', async () => {
      // Arrange
      const createDto = { formData: undefined } as unknown as CreateFormDto;

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Form data is required'
      );
    });

    it('should create form without customer when email is empty', async () => {
      // Arrange
      const formData = { ...createMockFormData(), email: '' };
      const createDto = { formData, currentStep: 0 };
      const mockForm = createMockForm({ customer: null, customerId: null });

      prisma.form.create.mockResolvedValue(mockForm);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(prisma.customer.upsert).not.toHaveBeenCalled();
      expect(prisma.form.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should return all forms sorted by createdAt desc', async () => {
      // Arrange
      const mockForms = [
        createMockForm(),
        createMockForm(),
        createMockForm(),
      ];

      prisma.form.findMany.mockResolvedValue(mockForms);

      // Act
      const result = await service.findAll();

      // Assert
      expect(prisma.form.findMany).toHaveBeenCalledWith({
        include: { customer: true, order: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('formData');
    });
  });

  describe('findOne', () => {
    it('should return a form by id', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const mockForm = createMockForm({ id: formId });

      prisma.form.findUnique.mockResolvedValue(mockForm);

      // Act
      const result = await service.findOne(formId);

      // Assert
      expect(prisma.form.findUnique).toHaveBeenCalledWith({
        where: { id: formId },
        include: { customer: true, order: true },
      });
      expect(result).toHaveProperty('id', formId);
    });

    it('should throw NotFoundException when form does not exist', async () => {
      // Arrange
      const formId = faker.string.uuid();

      prisma.form.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(formId)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.findOne(formId)).rejects.toThrow(
        'Form data not found'
      );
    });
  });

  describe('update', () => {
    it('should update a form', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const existingForm = createMockForm({ id: formId });
      const updatedFormData = createMockFormData();
      const updateDto = { formData: updatedFormData, currentStep: 3 };
      const updatedForm = createMockForm({
        id: formId,
        data: {
          ...(existingForm.data as Record<string, unknown>),
          currentStep: 3,
        },
      });

      prisma.form.findUnique
        .mockResolvedValueOnce(existingForm)
        .mockResolvedValueOnce(updatedForm);
      prisma.customer.upsert.mockResolvedValue(existingForm.customer!);
      prisma.form.update.mockResolvedValue(updatedForm);

      // Act
      const result = await service.update(formId, updateDto);

      // Assert
      expect(prisma.form.update).toHaveBeenCalled();
      expect(result).toHaveProperty('id', formId);
    });

    it('should throw NotFoundException when form does not exist', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const updateDto = { formData: createMockFormData() };

      prisma.form.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(formId, updateDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should update orderNumber when provided', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const existingForm = createMockForm({ id: formId });
      const orderNumber = faker.string.alphanumeric(10);
      const updateDto = { orderNumber };

      prisma.form.findUnique.mockResolvedValue(existingForm);
      prisma.form.update.mockResolvedValue(existingForm);
      prisma.order.upsert.mockResolvedValue({
        id: faker.string.uuid(),
        orderNumber,
        formId,
        customerId: existingForm.customerId!,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      await service.update(formId, updateDto);

      // Assert
      expect(prisma.order.upsert).toHaveBeenCalledWith({
        where: { formId },
        update: {
          orderNumber,
          customerId: existingForm.customerId,
        },
        create: {
          orderNumber,
          formId,
          customerId: existingForm.customerId!,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a form', async () => {
      // Arrange
      const formId = faker.string.uuid();

      prisma.form.delete.mockResolvedValue(createMockForm({ id: formId }));

      // Act
      await service.remove(formId);

      // Assert
      expect(prisma.form.delete).toHaveBeenCalledWith({
        where: { id: formId },
      });
    });

    it('should throw NotFoundException when form does not exist', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const error = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
      Object.assign(error, {
        code: 'P2025',
        meta: { cause: 'Record to delete does not exist.' },
        message: 'Record not found',
      });

      prisma.form.delete.mockRejectedValue(error);

      // Act & Assert
      return expect(service.remove(formId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('submit', () => {
    it('should submit a form and create an order', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const mockForm = createMockForm({
        id: formId,
        status: 'draft',
        customer: {
          id: faker.string.uuid(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      prisma.form.findUnique.mockResolvedValue(mockForm);
      prisma.form.update.mockResolvedValue({
        ...mockForm,
        status: 'submitted',
        submittedAt: new Date(),
      });

      // Act
      const result = await service.submit(formId);

      // Assert
      expect(prisma.form.findUnique).toHaveBeenCalledWith({
        where: { id: formId },
        include: { customer: true, order: true },
      });
      expect(prisma.form.update).toHaveBeenCalledWith({
        where: { id: formId },
        data: expect.objectContaining({
          status: 'submitted',
          submittedAt: expect.any(Date),
          order: {
            create: expect.objectContaining({
              orderNumber: expect.any(String),
              customerId: mockForm.customer!.id,
            }),
          },
        }),
      });
      expect(result).toHaveProperty('orderNumber');
      expect(result).toHaveProperty('submittedAt');
    });

    it('should throw NotFoundException when form does not exist', async () => {
      // Arrange
      const formId = faker.string.uuid();

      prisma.form.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.submit(formId)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when form is already submitted', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const mockForm = createMockForm({
        id: formId,
        status: 'submitted',
        submittedAt: new Date(),
      });

      prisma.form.findUnique.mockResolvedValue(mockForm);

      // Act & Assert
      await expect(service.submit(formId)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.submit(formId)).rejects.toThrow(
        'Form is already submitted'
      );
    });

    it('should throw BadRequestException when customer is missing', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const mockForm = createMockForm({
        id: formId,
        status: 'draft',
        customer: null,
        customerId: null,
      });

      prisma.form.findUnique.mockResolvedValue(mockForm);

      // Act & Assert
      await expect(service.submit(formId)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.submit(formId)).rejects.toThrow(
        'Cannot submit form without customer information'
      );
    });
  });

  describe('selectedAdditionalDesigns field handling', () => {
    it('should normalize selectedAdditionalDesigns array from DTO', async () => {
      // Arrange
      const formData = {
        ...createMockFormData(),
        selectedAdditionalDesigns: ['design-id-1', 'design-id-2'],
      };
      const createDto = { formData, currentStep: 0 };
      const mockCustomer = {
        id: faker.string.uuid(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.customer.upsert.mockResolvedValue(mockCustomer);
      prisma.form.create.mockResolvedValue(
        createMockForm({
          customerId: mockCustomer.id,
          data: {
            selectedAdditionalDesigns: ['design-id-1', 'design-id-2'],
            currentStep: 0,
          },
        })
      );

      // Act
      await service.create(createDto);

      // Assert
      expect(prisma.form.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data: expect.objectContaining({
              selectedAdditionalDesigns: ['design-id-1', 'design-id-2'],
            }),
          }),
        })
      );
    });

    it('should normalize empty array when selectedAdditionalDesigns is not provided', async () => {
      // Arrange
      const formData = {
        ...createMockFormData(),
        selectedAdditionalDesigns: undefined,
      };
      const createDto = { formData, currentStep: 0 };
      const mockCustomer = {
        id: faker.string.uuid(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.customer.upsert.mockResolvedValue(mockCustomer);
      prisma.form.create.mockResolvedValue(
        createMockForm({
          customerId: mockCustomer.id,
          data: {
            selectedAdditionalDesigns: [],
            currentStep: 0,
          },
        })
      );

      // Act
      await service.create(createDto);

      // Assert
      expect(prisma.form.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data: expect.objectContaining({
              selectedAdditionalDesigns: [],
            }),
          }),
        })
      );
    });

    it('should filter out non-string values from selectedAdditionalDesigns array', async () => {
      // Arrange
      const formData = {
        ...createMockFormData(),
        selectedAdditionalDesigns: ['valid-id', 123, null, 'another-valid-id', {}] as unknown as string[],
      };
      const createDto = { formData, currentStep: 0 };
      const mockCustomer = {
        id: faker.string.uuid(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.customer.upsert.mockResolvedValue(mockCustomer);
      prisma.form.create.mockResolvedValue(
        createMockForm({
          customerId: mockCustomer.id,
          data: {
            selectedAdditionalDesigns: ['valid-id', 'another-valid-id'],
            currentStep: 0,
          },
        })
      );

      // Act
      await service.create(createDto);

      // Assert
      expect(prisma.form.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data: expect.objectContaining({
              selectedAdditionalDesigns: ['valid-id', 'another-valid-id'],
            }),
          }),
        })
      );
    });

    it('should extract selectedAdditionalDesigns from stored form data', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const storedDesignIds = ['design-1', 'design-2', 'design-3'];
      const mockForm = createMockForm({
        id: formId,
        data: {
          selectedAdditionalDesigns: storedDesignIds,
          currentStep: 2,
        },
      });

      prisma.form.findUnique.mockResolvedValue(mockForm);

      // Act
      const result = await service.findOne(formId);

      // Assert
      expect(result.formData.selectedAdditionalDesigns).toEqual(storedDesignIds);
    });

    it('should return empty array when selectedAdditionalDesigns is not in stored data', async () => {
      // Arrange
      const formId = faker.string.uuid();
      const mockForm = createMockForm({
        id: formId,
        data: {
          // No selectedAdditionalDesigns field
          currentStep: 2,
        },
      });

      prisma.form.findUnique.mockResolvedValue(mockForm);

      // Act
      const result = await service.findOne(formId);

      // Assert
      expect(result.formData.selectedAdditionalDesigns).toEqual([]);
    });
  });
});

