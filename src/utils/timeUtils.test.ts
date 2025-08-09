import { describe, it, expect } from 'vitest';
import { generateTimeIntervals, parseTimeWindow } from './timeUtils';

describe('timeUtils', () => {
  describe('generateTimeIntervals', () => {
    it('generates 15-minute intervals for morning window', () => {
      const intervals = generateTimeIntervals('8:00 AM - 10:00 AM');
      
      expect(intervals).toEqual([
        '8:00 AM',
        '8:15 AM',
        '8:30 AM',
        '8:45 AM',
        '9:00 AM',
        '9:15 AM',
        '9:30 AM',
        '9:45 AM',
        '10:00 AM'
      ]);
    });
    
    it('generates 15-minute intervals for evening window', () => {
      const intervals = generateTimeIntervals('5:00 PM - 8:00 PM');
      
      expect(intervals).toEqual([
        '5:00 PM',
        '5:15 PM',
        '5:30 PM',
        '5:45 PM',
        '6:00 PM',
        '6:15 PM',
        '6:30 PM',
        '6:45 PM',
        '7:00 PM',
        '7:15 PM',
        '7:30 PM',
        '7:45 PM',
        '8:00 PM'
      ]);
    });
    
    it('generates intervals for a short window', () => {
      const intervals = generateTimeIntervals('8:00 AM - 9:00 AM');
      
      expect(intervals).toEqual([
        '8:00 AM',
        '8:15 AM',
        '8:30 AM',
        '8:45 AM',
        '9:00 AM'
      ]);
    });
    
    it('generates intervals for noon window', () => {
      const intervals = generateTimeIntervals('9:00 AM - 12:00 PM');
      
      expect(intervals).toEqual([
        '9:00 AM',
        '9:15 AM',
        '9:30 AM',
        '9:45 AM',
        '10:00 AM',
        '10:15 AM',
        '10:30 AM',
        '10:45 AM',
        '11:00 AM',
        '11:15 AM',
        '11:30 AM',
        '11:45 AM',
        '12:00 PM'
      ]);
    });
    
    it('generates intervals for afternoon window', () => {
      const intervals = generateTimeIntervals('3:00 PM - 7:00 PM');
      
      expect(intervals).toEqual([
        '3:00 PM',
        '3:15 PM',
        '3:30 PM',
        '3:45 PM',
        '4:00 PM',
        '4:15 PM',
        '4:30 PM',
        '4:45 PM',
        '5:00 PM',
        '5:15 PM',
        '5:30 PM',
        '5:45 PM',
        '6:00 PM',
        '6:15 PM',
        '6:30 PM',
        '6:45 PM',
        '7:00 PM'
      ]);
    });
    
    it('throws error for invalid time window format', () => {
      expect(() => generateTimeIntervals('invalid')).toThrow('Invalid time window format');
      expect(() => generateTimeIntervals('8:00 AM')).toThrow('Invalid time window format');
      expect(() => generateTimeIntervals('')).toThrow('Invalid time window format');
    });
    
    it('throws error for invalid time format', () => {
      expect(() => generateTimeIntervals('25:00 AM - 26:00 AM')).toThrow('Invalid time format');
      expect(() => generateTimeIntervals('8:00 - 9:00')).toThrow('Invalid time format');
    });
  });
  
  describe('parseTimeWindow', () => {
    it('parses a valid time window', () => {
      const result = parseTimeWindow('8:00 AM - 10:00 AM');
      
      expect(result).toEqual({
        start: '8:00 AM',
        end: '10:00 AM'
      });
    });
    
    it('handles windows with extra spaces', () => {
      const result = parseTimeWindow('  8:00 AM  -  10:00 AM  ');
      
      expect(result).toEqual({
        start: '8:00 AM',
        end: '10:00 AM'
      });
    });
    
    it('throws error for invalid format', () => {
      expect(() => parseTimeWindow('invalid')).toThrow('Invalid time window format');
      expect(() => parseTimeWindow('8:00 AM')).toThrow('Invalid time window format');
      expect(() => parseTimeWindow('')).toThrow('Invalid time window format');
    });
  });
});
