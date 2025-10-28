import { describe, it, expect } from 'vitest';
import type { FormData } from '@sweetly-dipped/shared-types';
import { formDataToDatabase, databaseToFormData } from '../services/form-service';

describe('form-service', () => {
  describe('formDataToDatabase', () => {
    it('extracts fields to columns correctly', () => {
      const formData: FormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        communicationMethod: 'email',
        packageType: 'medium',
        riceKrispies: 2,
        oreos: 1,
        pretzels: 0,
        marshmallows: 1,
        pickupDate: '2025-01-15',
        pickupTime: '8:30 AM',
        rushOrder: false,
        referralSource: 'Instagram',
        colorScheme: 'Pink and Gold',
        eventType: 'Birthday',
        theme: 'Princess',
        additionalDesigns: 'Add some sparkles',
        termsAccepted: true,
        visitedSteps: new Set(['lead', 'contact', 'package'])
      };

      const result = formDataToDatabase(formData, 'customer-123');

      expect(result.customerId).toBe('customer-123');
      expect(result.communicationMethod).toBe('email');
      expect(result.pickupDate).toBe('2025-01-15');
      expect(result.pickupTime).toBe('8:30 AM');
      expect(result.rushOrder).toBe(false);
      expect(result.packageType).toBe('medium');
      expect(result.riceKrispies).toBe(2);
      expect(result.oreos).toBe(1);
      expect(result.pretzels).toBe(0);
      expect(result.marshmallows).toBe(1);
      expect(result.referralSource).toBe('Instagram');
    });

    it('stores remaining fields in JSONB data', () => {
      const formData: FormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        communicationMethod: 'email',
        packageType: 'medium',
        riceKrispies: 2,
        oreos: 1,
        pretzels: 0,
        marshmallows: 1,
        pickupDate: '2025-01-15',
        pickupTime: '8:30 AM',
        rushOrder: false,
        referralSource: 'Instagram',
        colorScheme: 'Pink and Gold',
        eventType: 'Birthday',
        theme: 'Princess',
        additionalDesigns: 'Add some sparkles',
        termsAccepted: true,
        visitedSteps: new Set(['lead', 'contact', 'package'])
      };

      const result = formDataToDatabase(formData, 'customer-123');

      expect(result.data).toEqual({
        colorScheme: 'Pink and Gold',
        eventType: 'Birthday',
        theme: 'Princess',
        additionalDesigns: 'Add some sparkles',
        termsAccepted: true,
        visitedSteps: ['lead', 'contact', 'package'] // Set → Array
      });
    });

    it('handles null/empty values correctly', () => {
      const formData: FormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        communicationMethod: '',
        packageType: '',
        riceKrispies: 0,
        oreos: 0,
        pretzels: 0,
        marshmallows: 0,
        pickupDate: '',
        pickupTime: '',
        rushOrder: false,
        referralSource: '',
        colorScheme: '',
        eventType: '',
        theme: '',
        additionalDesigns: '',
        termsAccepted: false,
        visitedSteps: new Set()
      };

      const result = formDataToDatabase(formData, 'customer-123');

      expect(result.communicationMethod).toBe(null);
      expect(result.pickupDate).toBe(null);
      expect(result.pickupTime).toBe(null);
      expect(result.packageType).toBe(null);
      expect(result.referralSource).toBe(null);
      expect(result.data.visitedSteps).toEqual([]);
    });
  });

  describe('databaseToFormData', () => {
    it('reconstructs FormData from database model', () => {
      const dbForm = {
        id: 'form-123',
        customerId: 'customer-123',
        communicationMethod: 'email',
        pickupDate: '2025-01-15',
        pickupTime: '8:30 AM',
        rushOrder: false,
        packageType: 'medium',
        riceKrispies: 2,
        oreos: 1,
        pretzels: 0,
        marshmallows: 1,
        referralSource: 'Instagram',
        data: {
          colorScheme: 'Pink and Gold',
          eventType: 'Birthday',
          theme: 'Princess',
          additionalDesigns: 'Add some sparkles',
          termsAccepted: true,
          visitedSteps: ['lead', 'contact', 'package']
        },
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
        customer: {
          id: 'customer-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          createdAt: new Date('2025-01-01T10:00:00Z'),
          updatedAt: new Date('2025-01-01T10:00:00Z')
        }
      };

      const result = databaseToFormData(dbForm);

      expect(result.id).toBe('form-123');
      expect(result.formData.firstName).toBe('John');
      expect(result.formData.lastName).toBe('Doe');
      expect(result.formData.email).toBe('john.doe@example.com');
      expect(result.formData.phone).toBe('123-456-7890');
      expect(result.formData.communicationMethod).toBe('email');
      expect(result.formData.pickupDate).toBe('2025-01-15');
      expect(result.formData.pickupTime).toBe('8:30 AM');
      expect(result.formData.rushOrder).toBe(false);
      expect(result.formData.packageType).toBe('medium');
      expect(result.formData.riceKrispies).toBe(2);
      expect(result.formData.oreos).toBe(1);
      expect(result.formData.pretzels).toBe(0);
      expect(result.formData.marshmallows).toBe(1);
      expect(result.formData.referralSource).toBe('Instagram');
      expect(result.formData.colorScheme).toBe('Pink and Gold');
      expect(result.formData.eventType).toBe('Birthday');
      expect(result.formData.theme).toBe('Princess');
      expect(result.formData.additionalDesigns).toBe('Add some sparkles');
      expect(result.formData.termsAccepted).toBe(true);
      expect(result.formData.visitedSteps).toEqual(new Set(['lead', 'contact', 'package']));
    });

    it('handles null values in database fields', () => {
      const dbForm = {
        id: 'form-123',
        customerId: 'customer-123',
        communicationMethod: null,
        pickupDate: null,
        pickupTime: null,
        rushOrder: false,
        packageType: null,
        riceKrispies: 0,
        oreos: 0,
        pretzels: 0,
        marshmallows: 0,
        referralSource: null,
        data: {
          colorScheme: '',
          eventType: '',
          theme: '',
          additionalDesigns: '',
          termsAccepted: false,
          visitedSteps: []
        },
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
        customer: {
          id: 'customer-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          createdAt: new Date('2025-01-01T10:00:00Z'),
          updatedAt: new Date('2025-01-01T10:00:00Z')
        }
      };

      const result = databaseToFormData(dbForm);

      expect(result.formData.communicationMethod).toBe('');
      expect(result.formData.pickupDate).toBe('');
      expect(result.formData.pickupTime).toBe('');
      expect(result.formData.packageType).toBe('');
      expect(result.formData.referralSource).toBe('');
      expect(result.formData.visitedSteps).toEqual(new Set());
    });
  });
});
