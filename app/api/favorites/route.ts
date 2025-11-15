import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getUserIdFromRequest(request: NextRequest) {
  const token =
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.callback-url')?.value ||
    null;

  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { sessionToken: token } });
  if (!session) return null;
  return session.userId;
}

export async function GET(request: NextRequest) {
  try {
    // require next-auth session and return only favorites for the logged-in user
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(favorites);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Favorites GET error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { city, country, latitude, longitude } = body;
    if (!city || latitude == null || longitude == null) {
      return NextResponse.json({ error: 'city, latitude, longitude required' }, { status: 400 });
    }

    const fav = await prisma.favorite.create({
      data: {
        userId: userId,
        city,
        country: country || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
    });

    return NextResponse.json(fav);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Favorites POST error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to create favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    // ensure favorite belongs to the user
    const fav = await prisma.favorite.findUnique({ where: { id } });
    if (!fav || fav.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.favorite.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Favorites DELETE error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to delete favorite' },
      { status: 500 }
    );
  }
}
