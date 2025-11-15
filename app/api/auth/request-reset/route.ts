import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signResetToken } from '@/lib/jwt';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security don't reveal whether email exists
      return NextResponse.json({ message: 'If that email exists, you will receive reset instructions' });
    }

    const token = signResetToken({ id: user.id, email: user.email }, '1h');
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset?token=${token}`;

    // Send password reset email (test mode logs if EMAIL_SERVER not set)
    await sendPasswordResetEmail(email, resetLink, user.firstName || undefined);

    return NextResponse.json({ message: 'Reset link generated', resetLink });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
