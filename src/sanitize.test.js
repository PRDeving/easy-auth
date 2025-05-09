import { sanitizeString, sanitizeObject, sanitizeToken } from './sanitize.js';

describe('Sanitize Utilities', () => {
  describe('sanitizeString', () => {
    it('should sanitize strings with potential XSS content using default method', () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
      const actual = sanitizeString(input);
      expect(actual).toBe(expected);
    });
    
    it('should sanitize strings using custom regex patterns', () => {
      const input = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
      const patterns = [
        { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, replacement: '' },
        { pattern: /<[^>]*on\w+\s*=\s*["']?[^"']*["']?[^>]*>/gi, replacement: '' }
      ];
      
      const actual = sanitizeString(input, patterns);
      expect(actual).toBe('');
    });

    it('should handle null and undefined values', () => {
      expect(sanitizeString(null)).toBe(null);
      expect(sanitizeString(undefined)).toBe(undefined);
    });

    it('should return non-string values as is', () => {
      expect(sanitizeString(123)).toBe(123);
      expect(sanitizeString(true)).toBe(true);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string properties in an object using default method', () => {
      const input = {
        name: '<script>alert("XSS")</script>',
        age: 30,
        nested: {
          bio: '<img src="x" onerror="alert(1)">',
          active: true
        }
      };
      
      const sanitized = sanitizeObject(input);
      
      expect(sanitized.name).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(sanitized.age).toBe(30);
      expect(sanitized.nested.bio).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
      expect(sanitized.nested.active).toBe(true);
    });
    
    it('should sanitize all string properties in an object using custom regex patterns', () => {
      const input = {
        name: '<script>alert("XSS")</script>',
        age: 30,
        nested: {
          bio: '<img src="x" onerror="alert(1)">',
          active: true
        }
      };
      
      const patterns = [
        { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, replacement: '' },
        { pattern: /<[^>]*on\w+\s*=\s*["']?[^"']*["']?[^>]*>/gi, replacement: '' }
      ];
      
      const sanitized = sanitizeObject(input, patterns);
      
      expect(sanitized.name).toBe('');
      expect(sanitized.age).toBe(30);
      expect(sanitized.nested.bio).toBe('');
      expect(sanitized.nested.active).toBe(true);
    });

    it('should handle arrays', () => {
      const input = ['<script>', 123, { text: '<div>' }];
      const sanitized = sanitizeObject(input);
      
      expect(sanitized[0]).toBe('&lt;script&gt;');
      expect(sanitized[1]).toBe(123);
      expect(sanitized[2].text).toBe('&lt;div&gt;');
    });

    it('should handle null and undefined values', () => {
      expect(sanitizeObject(null)).toBe(null);
      expect(sanitizeObject(undefined)).toBe(undefined);
    });
  });

  describe('sanitizeToken', () => {
    it('should validate and return valid JWT tokens', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      expect(sanitizeToken(validToken)).toBe(validToken);
    });

    it('should return null for invalid JWT tokens', () => {
      expect(sanitizeToken('invalid-token')).toBe(null);
      expect(sanitizeToken('header.payload')).toBe(null);
      expect(sanitizeToken('')).toBe(null);
      expect(sanitizeToken(null)).toBe(null);
      expect(sanitizeToken(123)).toBe(null);
    });
  });
});
