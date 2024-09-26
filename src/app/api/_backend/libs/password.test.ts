import * as argon2 from 'argon2';
import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { logger } from '@/libs/logger';
import { compare, hash } from '@/libs/password';

vi.mock('argon2');
vi.mock('./logger');

describe('password library', () => {
  describe('hash function', () => {
    it('should return a hash and no error when hashing is successful', async () => {
      const mockHash = 'mockHash';
      (argon2.hash as Mock).mockResolvedValue(mockHash);

      const [result, error] = await hash('password123');

      expect(result).toBe(mockHash);
      expect(error).toBeNull();
    });

    it('should return an empty string and an error when hashing fails', async () => {
      const mockError = new Error('Hashing failed');
      (argon2.hash as Mock).mockRejectedValue(mockError);

      const [result, error] = await hash('password123');

      expect(result).toBe('');
      expect(error).toEqual(new Error('Failed to hash password'));
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });

  describe('compare function', () => {
    it('should return true and no error when password verification is successful', async () => {
      (argon2.verify as Mock).mockResolvedValue(true);

      const [result, error] = await compare('password123', 'mockHash');

      expect(result).toBe(true);
      expect(error).toBeNull();
    });

    it('should return false and an error when password verification fails', async () => {
      const mockError = new Error('Verification failed');
      (argon2.verify as Mock).mockRejectedValue(mockError);

      const [result, error] = await compare('password123', 'mockHash');

      expect(result).toBe(false);
      expect(error).toEqual(new Error('Failed to verify password'));
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });
});
