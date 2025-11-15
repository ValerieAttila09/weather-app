import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret';

export function signResetToken(payload: object, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyResetToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { [k: string]: any };
  } catch (err) {
    return null;
  }
}
