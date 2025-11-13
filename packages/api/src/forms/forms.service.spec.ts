import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FormsService } from './forms.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('FormsService', () => {
  let service: FormsService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      form: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      customer: {
        upsert: vi.fn(),
      },
      order: {
        create: vi.fn(),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new FormsService(prisma);
  });

  describe('submit', () => {
    it('should submit form successfully', async () => {
      const formId = 'form-123';
      const customerId = 'customer-123';
      const mockForm = {
        id: formId,
        status: 'draft',
        customer: {
          id: customerId,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        order: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        customerId,
        communicationMethod: 'email',
        pickupDate: '2025-01-15',
        pickupTime: '2:00 PM',
        rushOrder: false,
        packageType: 'medium',
        riceKrispies: 0,
        oreos: 0,
        pretzels: 0,
        marshmallows: 0,
        referralSource: null,
        data: {
          colorScheme: 'Blue',
          eventType: 'Birthday',
          theme: 'Superhero',
          additionalDesigns: '',
          termsAccepted: true,
          visitedSteps: ['lead'],
          currentStep: 0,
        },
      };

      vi.mocked(prisma.form.findUnique).mockResolvedValue(mockForm as never);
      vi.mocked(prisma.order.create).mockResolvedValue({
        id: 'order-123',
        orderNumber: '20250115-ABC123XYZ456',
        formId,
        customerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);
      vi.mocked(prisma.form.update).mockResolvedValue({
        ...mockForm,
        status: 'submitted',
        submittedAt: new Date(),
      } as never);

      const result = await service.submit(formId);

      expect(result).toHaveProperty('orderNumber');
      expect(result).toHaveProperty('submittedAt');
      expect(result.orderNumber).toMatch(/^\d{8}-[A-Z0-9]{12}$/);
      expect(prisma.form.findUnique).toHaveBeenCalledWith({
        where: { id: formId },
        include: { customer: true, order: true },
      });
      expect(prisma.order.create).toHaveBeenCalled();
      expect(prisma.form.update).toHaveBeenCalledWith({
        where: { id: formId },
        data: {
          status: 'submitted',
          submittedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException when form does not exist', async () => {
      vi.mocked(prisma.form.findUnique).mockResolvedValue(null);

      await expect(service.submit('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when form is already submitted', async () => {
      const formId = 'form-123';
      const mockForm = {
        id: formId,
        status: 'submitted',
        customer: {
          id: 'customer-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        order: {
          id: 'order-123',
          orderNumber: '20250115-ABC123XYZ456',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.form.findUnique).mockResolvedValue(mockForm as never);

      await expect(service.submit(formId)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.submit(formId)).rejects.toThrow(
        'Form is already submitted'
      );
    });

    it('should throw BadRequestException when customer does not exist', async () => {
      const formId = 'form-123';
      const mockForm = {
        id: formId,
        status: 'draft',
        customer: null,
        order: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.form.findUnique).mockResolvedValue(mockForm as never);

      await expect(service.submit(formId)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.submit(formId)).rejects.toThrow(
        'Cannot submit form without customer information'
      );
    });
  });
});

