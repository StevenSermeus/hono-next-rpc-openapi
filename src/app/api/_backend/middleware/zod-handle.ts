import { Context } from 'hono';
import { ZodError } from 'zod';

import { ConnectionAttemptsCounter, ConnectionAttemptsFailedCounter } from '@/libs/prometheus';

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

export const loginValidationHook = (
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
  ConnectionAttemptsCounter.inc(1);
  if (!result.success) {
    ConnectionAttemptsFailedCounter.inc(1);
    return c.json(
      {
        message: result.error.errors[0].message,
      },
      400
    );
  }
};
