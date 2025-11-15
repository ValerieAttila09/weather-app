import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyResetToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    const payload = verifyResetToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

    await prisma.user.update({ where: { id: payload.id }, data: { emailVerified: new Date() } });

    return NextResponse.json({ message: 'Email verified' });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
