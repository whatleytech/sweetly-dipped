import { describe, it, expect } from 'vitest';
import {
  calculateDesignOptionPrice,
  calculateAdditionalDesignsTotal,
} from './priceCalculations';
import type { AdditionalDesignOptionDto } from '@sweetly-dipped/shared-types';

describe('priceCalculations', () => {
  describe('calculateDesignOptionPrice', () => {
    it('should return basePrice for small package', () => {
      const option: AdditionalDesignOptionDto = {
        id: '1',
        name: 'Test',
        basePrice: 10,
        largePriceIncrease: 5,
        perDozenPrice: 8,
      };

      expect(calculateDesignOptionPrice(option, 'small')).toBe(10);
    });

    it('should return basePrice for medium package', () => {
      const option: AdditionalDesignOptionDto = {
        id: '1',
        name: 'Test',
        basePrice: 10,
        largePriceIncrease: 5,
        perDozenPrice: 8,
      };

      expect(calculateDesignOptionPrice(option, 'medium')).toBe(10);
    });

    it('should return basePrice + largePriceIncrease for large package when increase > 0', () => {
      const option: AdditionalDesignOptionDto = {
        id: '1',
        name: 'Test',
        basePrice: 10,
        largePriceIncrease: 5,
        perDozenPrice: 8,
      };

      expect(calculateDesignOptionPrice(option, 'large')).toBe(15);
    });

    it('should return basePrice only for large package when increase is 0', () => {
      const option: AdditionalDesignOptionDto = {
        id: '1',
        name: 'Test',
        basePrice: 10,
        largePriceIncrease: 0,
        perDozenPrice: 8,
      };

      expect(calculateDesignOptionPrice(option, 'large')).toBe(10);
    });

    it('should return basePrice + largePriceIncrease for xl package when increase > 0', () => {
      const option: AdditionalDesignOptionDto = {
        id: '1',
        name: 'Test',
        basePrice: 10,
        largePriceIncrease: 5,
        perDozenPrice: 8,
      };

      expect(calculateDesignOptionPrice(option, 'xl')).toBe(15);
    });

    it('should return basePrice only for xl package when increase is 0', () => {
      const option: AdditionalDesignOptionDto = {
        id: '1',
        name: 'Test',
        basePrice: 10,
        largePriceIncrease: 0,
        perDozenPrice: 8,
      };

      expect(calculateDesignOptionPrice(option, 'xl')).toBe(10);
    });

    it('should return perDozenPrice for by-dozen package when set', () => {
      const option: AdditionalDesignOptionDto = {
        id: '1',
        name: 'Test',
        basePrice: 10,
        largePriceIncrease: 5,
        perDozenPrice: 8,
      };

      expect(calculateDesignOptionPrice(option, 'by-dozen')).toBe(8);
    });

    it('should return basePrice for by-dozen package when perDozenPrice is not set', () => {
      const option: AdditionalDesignOptionDto = {
        id: '1',
        name: 'Test',
        basePrice: 10,
        largePriceIncrease: 5,
      };

      expect(calculateDesignOptionPrice(option, 'by-dozen')).toBe(10);
    });

    it('should return basePrice for empty package type', () => {
      const option: AdditionalDesignOptionDto = {
        id: '1',
        name: 'Test',
        basePrice: 10,
        largePriceIncrease: 5,
        perDozenPrice: 8,
      };

      expect(calculateDesignOptionPrice(option, '')).toBe(10);
    });
  });

  describe('calculateAdditionalDesignsTotal', () => {
    const designOptions: AdditionalDesignOptionDto[] = [
      {
        id: '1',
        name: 'Option 1',
        basePrice: 10,
        largePriceIncrease: 5,
        perDozenPrice: 8,
      },
      {
        id: '2',
        name: 'Option 2',
        basePrice: 20,
        largePriceIncrease: 0,
        perDozenPrice: 15,
      },
      {
        id: '3',
        name: 'Option 3',
        basePrice: 30,
        largePriceIncrease: 10,
      },
    ];

    it('should return 0 for empty array', () => {
      expect(
        calculateAdditionalDesignsTotal([], designOptions, 'small')
      ).toBe(0);
    });

    it('should calculate total for small package', () => {
      expect(
        calculateAdditionalDesignsTotal(['1', '2'], designOptions, 'small')
      ).toBe(30); // 10 + 20
    });

    it('should calculate total for medium package', () => {
      expect(
        calculateAdditionalDesignsTotal(['1', '2'], designOptions, 'medium')
      ).toBe(30); // 10 + 20
    });

    it('should calculate total for large package with price increases', () => {
      expect(
        calculateAdditionalDesignsTotal(['1', '2'], designOptions, 'large')
      ).toBe(35); // (10 + 5) + 20
    });

    it('should calculate total for xl package with price increases', () => {
      expect(
        calculateAdditionalDesignsTotal(['1', '3'], designOptions, 'xl')
      ).toBe(55); // (10 + 5) + (30 + 10)
    });

    it('should calculate total for by-dozen package using perDozenPrice when available', () => {
      expect(
        calculateAdditionalDesignsTotal(['1', '2'], designOptions, 'by-dozen')
      ).toBe(23); // 8 + 15
    });

    it('should fallback to basePrice for by-dozen when perDozenPrice not set', () => {
      expect(
        calculateAdditionalDesignsTotal(['3'], designOptions, 'by-dozen')
      ).toBe(30); // basePrice since perDozenPrice is undefined
    });

    it('should ignore invalid IDs', () => {
      expect(
        calculateAdditionalDesignsTotal(
          ['1', 'invalid-id', '2'],
          designOptions,
          'small'
        )
      ).toBe(30); // 10 + 20, invalid-id ignored
    });

    it('should handle empty package type', () => {
      expect(
        calculateAdditionalDesignsTotal(['1', '2'], designOptions, '')
      ).toBe(30); // basePrice for both
    });
  });
});

