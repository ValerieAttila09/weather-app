import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    // Attempt to read server session using NextAuth helper
    const session = await getServerSession(authOptions as any);

    // Collect request headers and cookies for debugging
    const headers: Record<string, string> = {};
    for (const [key, value] of req.headers.entries()) headers[key] = value;

    const cookies: Record<string, string> = {};
    for (const c of req.cookies.getAll()) cookies[c.name] = c.value;

    return NextResponse.json({ ok: true, session: session ?? null, headers, cookies });
  } catch (err) {
    console.error('Debug session error', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
