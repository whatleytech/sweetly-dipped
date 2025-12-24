import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configApi } from './configApi';
import type { AdditionalDesignOptionDto } from '@sweetly-dipped/shared-types';

// Mock fetch globally
global.fetch = vi.fn();

describe('configApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdditionalDesignOptions', () => {
    it('should fetch and return additional design options', async () => {
      const mockOptions: AdditionalDesignOptionDto[] = [
        {
          id: 'option-1',
          name: 'Sprinkles',
          description: 'Custom sprinkles decoration',
          basePrice: 10,
          largePriceIncrease: 0,
        },
        {
          id: 'option-2',
          name: 'Gold or silver painted',
          description: 'Gold or silver painted accents',
          basePrice: 20,
          largePriceIncrease: 0,
          perDozenPrice: 15,
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptions,
      } as Response);

      const result = await configApi.getAdditionalDesignOptions();

      expect(result).toEqual(mockOptions);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/config/additional-designs')
      );
    });

    it('should throw error on failed request', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(configApi.getAdditionalDesignOptions()).rejects.toThrow(
        'Failed to fetch additional-designs: 500'
      );
    });

    it('should use correct API endpoint', async () => {
      const mockOptions: AdditionalDesignOptionDto[] = [];
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptions,
      } as Response);

      await configApi.getAdditionalDesignOptions();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/config\/additional-designs$/)
      );
    });
  });
});

