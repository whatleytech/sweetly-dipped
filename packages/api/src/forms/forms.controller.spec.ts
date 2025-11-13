import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormsController } from './forms.controller.js';
import { FormsService } from './forms.service.js';

describe('FormsController', () => {
  let controller: FormsController;
  let service: FormsService;

  beforeEach(() => {
    service = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      submit: vi.fn(),
    } as unknown as FormsService;

    controller = new FormsController(service);
  });

  describe('submit', () => {
    it('should call service submit method', async () => {
      const formId = 'form-123';
      const mockResponse = {
        orderNumber: '20250115-ABC123XYZ456',
        submittedAt: '2025-01-15T10:00:00Z',
      };

      vi.mocked(service.submit).mockResolvedValue(mockResponse);

      const result = await controller.submit(formId);

      expect(result).toEqual(mockResponse);
      expect(service.submit).toHaveBeenCalledWith(formId);
      expect(service.submit).toHaveBeenCalledOnce();
    });
  });
});

