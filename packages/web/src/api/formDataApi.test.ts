import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formDataApi, FormDataApiError } from './formDataApi';
import type { FormData } from '@sweetly-dipped/shared-types';

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
    selectedAdditionalDesigns: [],
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

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:3001/api/forms');
      expect(callArgs[1]).toMatchObject({
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
      });
      expect(callArgs[1].signal).toBeInstanceOf(AbortSignal);

      expect(result).toEqual(mockResponse);
    });

    it('throws structured error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      });

      try {
        await formDataApi.create({ formData: mockFormData });
      } catch (error) {
        expect(error).toBeInstanceOf(FormDataApiError);
        if (error instanceof FormDataApiError) {
          expect(error.type).toBe('validation');
          expect(error.status).toBe(400);
          expect(error.retryable).toBe(false);
        }
      }
    });

    it('throws network error on connection failure', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      try {
        await formDataApi.create({ formData: mockFormData });
      } catch (error) {
        expect(error).toBeInstanceOf(FormDataApiError);
        if (error instanceof FormDataApiError) {
          expect(error.type).toBe('network');
          expect(error.retryable).toBe(false);
        }
      }
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

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:3001/api/forms/form-123');
      expect(callArgs[1]).toMatchObject({});
      expect(callArgs[1].signal).toBeInstanceOf(AbortSignal);

      expect(result).toEqual(mockResponse);
    });

    it('throws not-found error when form not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Form data not found' }),
      });

      try {
        await formDataApi.get('nonexistent');
      } catch (error) {
        expect(error).toBeInstanceOf(FormDataApiError);
        if (error instanceof FormDataApiError) {
          expect(error.type).toBe('not-found');
          expect(error.status).toBe(404);
          expect(error.retryable).toBe(false);
        }
      }
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

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:3001/api/forms/form-123');
      expect(callArgs[1]).toMatchObject({
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
      });
      expect(callArgs[1].signal).toBeInstanceOf(AbortSignal);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('deletes form data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await formDataApi.delete('form-123');

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:3001/api/forms/form-123');
      expect(callArgs[1]).toMatchObject({
        method: 'DELETE',
      });
      expect(callArgs[1].signal).toBeInstanceOf(AbortSignal);
    });

    it('throws error on failed deletion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      try {
        await formDataApi.delete('nonexistent');
      } catch (error) {
        expect(error).toBeInstanceOf(FormDataApiError);
        if (error instanceof FormDataApiError) {
          expect(error.type).toBe('not-found');
          expect(error.status).toBe(404);
          expect(error.retryable).toBe(false);
        }
      }
    });
  });

  describe('submitForm', () => {
    it('submits form successfully', async () => {
      const mockResponse = {
        orderNumber: '20250115-ABC123XYZ456',
        submittedAt: '2025-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await formDataApi.submitForm('form-123');

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:3001/api/forms/form-123/submit');
      expect(callArgs[1]).toMatchObject({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(callArgs[1].signal).toBeInstanceOf(AbortSignal);

      expect(result).toEqual(mockResponse);
    });

    it('throws server error on failed submission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await formDataApi.submitForm('form-123');
      } catch (error) {
        expect(error).toBeInstanceOf(FormDataApiError);
        if (error instanceof FormDataApiError) {
          expect(error.type).toBe('server');
          expect(error.status).toBe(500);
          expect(error.retryable).toBe(true);
        }
      }
    });

    it('throws bad request error when form is already submitted', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Form is already submitted' }),
      });

      try {
        await formDataApi.submitForm('form-123');
      } catch (error) {
        expect(error).toBeInstanceOf(FormDataApiError);
        if (error instanceof FormDataApiError) {
          expect(error.type).toBe('validation');
          expect(error.status).toBe(400);
          expect(error.retryable).toBe(false);
        }
      }
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

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:3001/api/health');
      expect(callArgs[1]).toMatchObject({});
      expect(callArgs[1].signal).toBeInstanceOf(AbortSignal);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('handles timeout errors correctly', async () => {
      // Mock a timeout error by rejecting with a TypeError (simulating network failure)
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      try {
        await formDataApi.health();
      } catch (error) {
        expect(error).toBeInstanceOf(FormDataApiError);
        if (error instanceof FormDataApiError) {
          expect(error.type).toBe('network');
          expect(error.retryable).toBe(false);
        }
      }
    });

    it('handles abort errors correctly', async () => {
      const abortError = new Error('Request was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      try {
        await formDataApi.health();
      } catch (error) {
        expect(error).toBeInstanceOf(FormDataApiError);
        if (error instanceof FormDataApiError) {
          expect(error.type).toBe('timeout');
          expect(error.retryable).toBe(false);
        }
      }
    });
  });
});
