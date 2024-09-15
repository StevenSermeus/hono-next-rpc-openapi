import * as bcrypt from 'bcrypt';

import { env } from '@/config/env';

export function hash(password: string): [string, Error | null] {
  try {
    const salt = bcrypt.genSaltSync(env.SALT_ROUNDS);
    const hash = bcrypt.hashSync(password, salt);
    return [hash, null];
  } catch (error) {
    console.error(error);
    return ['', new Error('Failed to hash password')];
  }
}

export function compare(password: string, hash: string): [boolean, Error | null] {
  try {
    return [bcrypt.compareSync(password, hash), null];
  } catch (error) {
    console.error(error);
    return [false, new Error('Failed to verify password')];
  }
}
