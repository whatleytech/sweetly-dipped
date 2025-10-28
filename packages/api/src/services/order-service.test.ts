import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateOrderNumber } from '../services/order-service';
import { prisma } from '../db/prisma';

// Mock Prisma
vi.mock('../db/prisma', () => ({
  prisma: {
    order: {
      count: vi.fn()
    }
  }
}));

describe('order-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateOrderNumber', () => {
    it('generates order number with correct format for first order of day', async () => {
      const mockCount = vi.mocked(prisma.order.count);
      mockCount.mockResolvedValue(0);

      const result = await generateOrderNumber('2025-01-15');

      expect(result).toBe('2025-01-15-001');
      expect(mockCount).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date('2025-01-15T00:00:00.000Z'),
            lt: new Date('2025-01-15T23:59:59.999Z')
          }
        }
      });
    });

    it('generates sequential order numbers within same day', async () => {
      const mockCount = vi.mocked(prisma.order.count);
      mockCount.mockResolvedValue(5);

      const result = await generateOrderNumber('2025-01-15');

      expect(result).toBe('2025-01-15-006');
    });

    it('handles double-digit order numbers', async () => {
      const mockCount = vi.mocked(prisma.order.count);
      mockCount.mockResolvedValue(15);

      const result = await generateOrderNumber('2025-01-15');

      expect(result).toBe('2025-01-15-016');
    });

    it('handles triple-digit order numbers', async () => {
      const mockCount = vi.mocked(prisma.order.count);
      mockCount.mockResolvedValue(123);

      const result = await generateOrderNumber('2025-01-15');

      expect(result).toBe('2025-01-15-124');
    });

    it('resets numbering for new day', async () => {
      const mockCount = vi.mocked(prisma.order.count);
      mockCount.mockResolvedValue(0);

      const result = await generateOrderNumber('2025-01-16');

      expect(result).toBe('2025-01-16-001');
      expect(mockCount).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date('2025-01-16T00:00:00.000Z'),
            lt: new Date('2025-01-16T23:59:59.999Z')
          }
        }
      });
    });
  });
});
