import { Context } from 'hono';
import { ZodError } from 'zod';

export const defaultHook = (
  result:
    | {
        success: false;
        error: ZodError;
      }
    | {
        success: true;
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any;
      },
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  c: Context
) => {
  if (!result.success) {
    return c.json(
      {
        message: result.error.errors[0].message,
      },
      400
    );
  }
};
