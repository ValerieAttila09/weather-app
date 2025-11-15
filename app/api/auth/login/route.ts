import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName } = body;
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const user = await prisma.user.upsert({
      where: { email },
      update: { firstName: firstName || undefined, lastName: lastName || undefined },
      create: { email, firstName: firstName || null, lastName: lastName || null, password: crypto.randomBytes(16).toString('hex') },
    });

    const token = signToken({ id: user.id }, 60 * 60 * 24 * 30);

    const res = NextResponse.json({ user });
    res.cookies.set('auth', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
