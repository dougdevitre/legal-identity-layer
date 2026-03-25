/**
 * @module AuthProvider Tests
 * @description Tests for the AuthProvider class covering authentication,
 * token refresh, and validation flows.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../src/auth/provider';

describe('AuthProvider', () => {
  let auth: AuthProvider;

  beforeEach(() => {
    auth = new AuthProvider({
      issuer: 'https://auth.justiceos.org',
      clientId: 'test-client',
    });
  });

  describe('authenticate', () => {
    it('should return a token payload on valid credentials', async () => {
      const result = await auth.authenticate({
        grantType: 'authorization_code',
        code: 'valid-auth-code',
        redirectUri: 'https://app.example.com/callback',
      });
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.tokenType).toBe('Bearer');
    });

    it('should throw on invalid authorization code', async () => {
      await expect(
        auth.authenticate({
          grantType: 'authorization_code',
          code: '',
          redirectUri: 'https://app.example.com/callback',
        })
      ).rejects.toThrow();
    });

    it('should include expiry information', async () => {
      const result = await auth.authenticate({
        grantType: 'authorization_code',
        code: 'valid-auth-code',
        redirectUri: 'https://app.example.com/callback',
      });
      expect(result.expiresIn).toBeGreaterThan(0);
    });
  });

  describe('refresh', () => {
    it('should return a new token on valid refresh token', async () => {
      const result = await auth.refresh('valid-refresh-token');
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it('should throw on expired refresh token', async () => {
      await expect(auth.refresh('expired-token')).rejects.toThrow();
    });
  });

  describe('validate', () => {
    it('should return true for a valid access token', async () => {
      const isValid = await auth.validate('valid-access-token');
      expect(typeof isValid).toBe('boolean');
    });

    it('should return false for an expired token', async () => {
      const isValid = await auth.validate('expired-access-token');
      expect(isValid).toBe(false);
    });

    it('should return false for a malformed token', async () => {
      const isValid = await auth.validate('not-a-real-token');
      expect(isValid).toBe(false);
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should generate a valid authorization URL', () => {
      const url = auth.getAuthorizationUrl('https://app.example.com/callback');
      expect(url).toContain('https://auth.justiceos.org');
      expect(url).toContain('client_id=test-client');
      expect(url).toContain('redirect_uri=');
    });
  });
});
