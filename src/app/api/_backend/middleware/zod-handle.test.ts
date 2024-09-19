import { Context } from 'hono';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { defaultHook } from './zod-handle';

describe('defaultHook', () => {
  it('should return a 400 response with the error message when result is unsuccessful', () => {
    const mockContext = {
      json: (body: object, status: number) => ({ body, status }),
    } as unknown as Context;

    const zodError = new ZodError([{ message: 'Invalid input', path: [], code: 'custom' }]);
    const result: { success: false; error: ZodError } = { success: false, error: zodError };

    const response = defaultHook(result, mockContext);

    expect(response).toEqual({
      body: { message: 'Invalid input' },
      status: 400,
    });
  });

  it('should not return anything when result is successful', () => {
    const mockContext = {
      json: (body: object, status: number) => ({ body, status }),
    } as unknown as Context;

    const result: { success: true; data: Record<string, never> } = { success: true, data: {} };

    const response = defaultHook(result, mockContext);

    expect(response).toBeUndefined();
  });
});
