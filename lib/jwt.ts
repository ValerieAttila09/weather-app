import jwt from 'jsonwebtoken';

const SECRET = (process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret') as string;

export function signResetToken(payload: object, expiresIn: string | number = '1h') {
  // @ts-ignore - TypeScript/jwt types compatibility issue
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyResetToken(token: string) {
  try {
    // @ts-ignore - TypeScript/jwt types compatibility issue
    return jwt.verify(token, SECRET) as { [k: string]: any };
  } catch (err) {
    return null;
  }
}
