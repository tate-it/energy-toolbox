import { describe, expect, it } from 'vitest';
import { parseAsFormData } from './nuqs-parsers';

describe('parseAsFormData', () => {
  describe('parse', () => {
    it('should parse valid base64 encoded JSON', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const encoded = btoa(JSON.stringify(data));

      const result = parseAsFormData.parse(encoded);

      expect(result).toEqual(data);
    });

    it('should return empty object for empty string', () => {
      const result = parseAsFormData.parse('');

      expect(result).toEqual({});
    });

    it('should return empty object for invalid base64', () => {
      const result = parseAsFormData.parse('invalid-base64!');

      expect(result).toEqual({});
    });

    it('should return empty object for valid base64 but invalid JSON', () => {
      const invalidJson = btoa('invalid json {');

      const result = parseAsFormData.parse(invalidJson);

      expect(result).toEqual({});
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: {
          name: 'John',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
        items: ['item1', 'item2'],
      };
      const encoded = btoa(JSON.stringify(complexData));

      const result = parseAsFormData.parse(encoded);

      expect(result).toEqual(complexData);
    });
  });

  describe('serialize', () => {
    it('should serialize object to base64 encoded JSON', () => {
      const data = { name: 'John', email: 'john@example.com' };

      const result = parseAsFormData.serialize(data);

      const decoded = JSON.parse(atob(result));
      expect(decoded).toEqual(data);
    });

    it('should return empty string for empty object', () => {
      const result = parseAsFormData.serialize({});

      expect(result).toBe('');
    });

    it('should return empty string for null', () => {
      const result = parseAsFormData.serialize(null);

      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const result = parseAsFormData.serialize(undefined);

      expect(result).toBe('');
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: {
          name: 'John',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
        items: ['item1', 'item2'],
      };

      const result = parseAsFormData.serialize(complexData);

      const decoded = JSON.parse(atob(result));
      expect(decoded).toEqual(complexData);
    });

    it('should return empty string for objects that cannot be serialized', () => {
      const circularRef: Record<string, unknown> = {};
      circularRef.self = circularRef;

      const result = parseAsFormData.serialize(circularRef);

      expect(result).toBe('');
    });
  });

  describe('round-trip serialization', () => {
    it('should maintain data integrity through parse/serialize cycle', () => {
      const originalData = {
        vatNumber: 'IT12345678901',
        offerCode: 'OFFER2024',
        marketType: '01' as const,
        clientType: 'domestic' as const,
        nested: {
          array: [1, 2, 3],
          boolean: true,
          null: null,
        },
      };

      const serialized = parseAsFormData.serialize(originalData);
      const parsed = parseAsFormData.parse(serialized);

      expect(parsed).toEqual(originalData);
    });
  });
});
