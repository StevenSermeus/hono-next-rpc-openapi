import { z } from '@hono/zod-openapi';

export const UserSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '47fd1912-ba50-445e-8c30-77e4b161aa9c' }),
    email: z.string().email().openapi({ example: 'johndoe@gmail.com' }),
    name: z.string().openapi({ example: 'John Doe' }),
  })
  .openapi('User');
