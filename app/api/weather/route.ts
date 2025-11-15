import { NextRequest, NextResponse } from 'next/server';
import {
  getWeatherByCoordinates,
  getWeatherDescription,
  getWeatherIcon,
  reverseGeocoding,
} from '@/lib/weatherService';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = parseFloat(searchParams.get('lat') || '0');
    const longitude = parseFloat(searchParams.get('lng') || '0');
    const days = parseInt(searchParams.get('days') || '7', 10);
    const userId = searchParams.get('userId');

    if (latitude === 0 || longitude === 0) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Get weather data from API
    const weatherData = await getWeatherByCoordinates(latitude, longitude);

    // Get reverse geocoding for city/country
    const geoData = await reverseGeocoding(latitude, longitude);
    const location =
      geoData.results && geoData.results.length > 0
        ? geoData.results[0]
        : null;
    const city = location?.name ?? 'Unknown';
    const country = location?.country ?? 'Unknown';

    // Prepare weather response
    const current = weatherData.current;
    const daily = weatherData.daily;

    // determine current UV index if available
    let uvIndex: number | null = null;
    if (
      weatherData.hourly &&
      Array.isArray(weatherData.hourly.time) &&
      Array.isArray(weatherData.hourly.uv_index)
    ) {
      const now = new Date();
      const isoPrefix = now.toISOString().slice(0, 13);
      const idx = weatherData.hourly.time.findIndex((t) =>
        t.startsWith(isoPrefix)
      );
      if (idx !== -1 && weatherData.hourly.uv_index[idx] !== undefined) {
        uvIndex = weatherData.hourly.uv_index[idx];
      } else if (weatherData.hourly.uv_index.length > 0) {
        uvIndex = weatherData.hourly.uv_index[0] ?? null;
      }
    }

    const response = {
      city,
      country,
      latitude,
      longitude,
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      uvIndex,
      description: getWeatherDescription(current.weather_code),
      icon: getWeatherIcon(current.weather_code),
      pressure: 1013, // Open-Meteo doesn't provide pressure, using default
      sunrise: daily.sunrise[0],
      sunset: daily.sunset[0],
      forecast: daily.time
        .map((time, idx) => ({
          date: time,
          tempMax: daily.temperature_2m_max[idx],
          tempMin: daily.temperature_2m_min[idx],
          uvIndexMax: daily.uv_index_max ? daily.uv_index_max[idx] : null,
        }))
        .slice(0, Math.max(1, Math.min(days, daily.time.length))),
    };

    // Save to database if userId provided
    if (userId) {
      try {
        await prisma.weather.create({
          data: {
            userId,
            city,
            country,
            temperature: current.temperature_2m,
            feelsLike: current.apparent_temperature,
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            pressure: 1013,
            description: getWeatherDescription(current.weather_code),
            icon: getWeatherIcon(current.weather_code),
            latitude,
            longitude,
            sunrise: new Date(daily.sunrise[0]),
            sunset: new Date(daily.sunset[0]),
            uvIndex: uvIndex ?? undefined,
          },
        });
      } catch (dbError) {
        const dbErrorMsg =
          dbError instanceof Error ? dbError.message : 'Unknown database error';
        console.error('Error saving weather to database:', dbErrorMsg);
        // Don't fail the response if database save fails
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Weather API error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
