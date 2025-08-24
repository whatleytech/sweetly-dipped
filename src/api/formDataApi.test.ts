import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formDataApi } from './formDataApi';
import type { FormData } from '../types/formTypes';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('formDataApi', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockFormData: FormData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    communicationMethod: 'email',
    packageType: 'medium',
    riceKrispies: 2,
    oreos: 1,
    pretzels: 0,
    marshmallows: 1,
    colorScheme: 'Blue',
    eventType: 'Birthday',
    theme: 'Superhero',
    additionalDesigns: '',
    pickupDate: '2025-01-15',
    pickupTime: '2:00 PM',
    rushOrder: false,
    referralSource: 'Social Media',
    termsAccepted: true,
    visitedSteps: new Set(['lead', 'communication']),
  };

  describe('create', () => {
    it('creates new form data successfully', async () => {
      const mockResponse = {
        id: 'form-123',
        formData: mockFormData,
        currentStep: 0,
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await formDataApi.create({
        formData: mockFormData,
        currentStep: 0,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/form-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData: {
              ...mockFormData,
              visitedSteps: ['lead', 'communication'],
            },
            currentStep: 0,
          }),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('throws error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      });

      await expect(
        formDataApi.create({ formData: mockFormData })
      ).rejects.toThrow('Bad request');
    });
  });

  describe('get', () => {
    it('retrieves form data successfully', async () => {
      const mockResponse = {
        id: 'form-123',
        formData: mockFormData,
        currentStep: 2,
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await formDataApi.get('form-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/form-data/form-123'
      );

      expect(result).toEqual(mockResponse);
    });

    it('throws error when form not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Form data not found' }),
      });

      await expect(formDataApi.get('nonexistent')).rejects.toThrow(
        'Form data not found'
      );
    });
  });

  describe('update', () => {
    it('updates form data successfully', async () => {
      const mockResponse = {
        id: 'form-123',
        formData: { ...mockFormData, firstName: 'Jane' },
        currentStep: 3,
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T11:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await formDataApi.update('form-123', {
        formData: { ...mockFormData, firstName: 'Jane' },
        currentStep: 3,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/form-data/form-123',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData: { 
              ...mockFormData, 
              firstName: 'Jane',
              visitedSteps: ['lead', 'communication'],
            },
            currentStep: 3,
          }),
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('deletes form data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await formDataApi.delete('form-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/form-data/form-123',
        {
          method: 'DELETE',
        }
      );
    });

    it('throws error on failed deletion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(formDataApi.delete('nonexistent')).rejects.toThrow(
        'Failed to delete form data: 404'
      );
    });
  });

  describe('generateOrderNumber', () => {
    it('generates order number successfully', async () => {
      const mockResponse = {
        orderNumber: '2025-01-15-001',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await formDataApi.generateOrderNumber();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/order/number",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('throws error on failed generation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(formDataApi.generateOrderNumber()).rejects.toThrow(
        'Unknown error'
      );
    });
  });

  describe('health', () => {
    it('returns health status successfully', async () => {
      const mockResponse = {
        status: 'ok',
        timestamp: '2025-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await formDataApi.health();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/health'
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
