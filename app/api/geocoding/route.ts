import { NextRequest, NextResponse } from 'next/server';
import { getGeocoding } from '@/lib/weatherService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const geoData = await getGeocoding(query, Math.min(limit, 50));

    const results = geoData.results
      ? geoData.results.map((result) => ({
        id: result.id,
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country || result.country_code,
        admin1: result.admin1,
      }))
      : [];

    return NextResponse.json({ results });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Geocoding API error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch geocoding data' },
      { status: 500 }
    );
  }
}
