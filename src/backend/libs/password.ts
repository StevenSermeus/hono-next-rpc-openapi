import * as argon2 from 'argon2';

export async function hash(password: string): Promise<[string, Error | null]> {
  try {
    const hash = await argon2.hash(password);
    return [hash, null];
  } catch (error) {
    console.error(error);
    return ['', new Error('Failed to hash password')];
  }
}

export async function compare(password: string, hash: string): Promise<[boolean, Error | null]> {
  try {
    return [await argon2.verify(hash, password), null];
  } catch (error) {
    console.error(error);
    return [false, new Error('Failed to verify password')];
  }
}
