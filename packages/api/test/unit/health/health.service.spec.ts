import { HealthService } from '../../../src/health/health.service.js';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService();
  });

  describe('getStatus', () => {
    it('should return status ok with timestamp', () => {
      // Arrange
      const beforeTime = new Date().toISOString();

      // Act
      const result = service.getStatus();

      // Assert
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeTruthy();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTime).getTime()
      );
    });

    it('should return a valid ISO timestamp', () => {
      // Act
      const result = service.getStatus();

      // Assert
      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });
});


