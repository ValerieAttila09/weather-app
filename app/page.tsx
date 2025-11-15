'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { useLocationStore } from '@/store/locationStore';
import { useUIStore } from '@/store/uiStore';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import UVChart from '@/components/UVChart';
import FavoritesList from '@/components/FavoritesList';

interface SearchResultItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const { setCurrentWeather, setLoading, setError, currentWeather, loading } =
    useWeatherStore();
  const { forecastDays, unit, refreshIntervalMinutes, toggleUnit, setForecastDays } = useUIStore();
  const {
    latitude,
    longitude,
    city,
    country,
    setLocation,
    setCityCountry,
    error: locationError,
  } = useLocationStore();

  const refreshRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    getGeolocation();
  }, []);

  const { data: session } = useSession();

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    }
  }, [latitude, longitude]);

  // Polling for realtime updates based on refreshIntervalMinutes
  useEffect(() => {
    if (!latitude || !longitude) return;
    // clear previous
    if (refreshRef.current) {
      window.clearInterval(refreshRef.current);
      refreshRef.current = null;
    }
    const ms = Math.max(1, refreshIntervalMinutes) * 60 * 1000;
    const id = window.setInterval(() => {
      fetchWeather(latitude, longitude);
    }, ms);
    refreshRef.current = id;
    return () => {
      if (refreshRef.current) window.clearInterval(refreshRef.current);
    };
  }, [latitude, longitude, refreshIntervalMinutes]);

  const getGeolocation = () => {
    setIsLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoadingLocation(false);
        }
      );
    }
  };

  const fetchWeather = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/weather?lat=${lat}&lng=${lng}&days=${forecastDays}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setCityCountry(data.city, data.country);
        setCurrentWeather({
          id: Math.random().toString(),
          city: data.city,
          country: data.country,
          temperature: data.temperature,
          feelsLike: data.feelsLike,
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          pressure: data.pressure,
          description: data.description,
          icon: data.icon,
          latitude: data.latitude,
          longitude: data.longitude,
          sunrise: data.sunrise,
          sunset: data.sunset,
          uvIndex: data.uvIndex ?? null,
          forecast: data.forecast ?? null,
        });
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
      setIsLoadingLocation(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/geocoding?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCity = (result: SearchResultItem) => {
    setLocation(result.latitude, result.longitude);
    setCityCountry(result.name, result.country);
    setQuery('');
    setResults([]);
  };

  if (!mounted) return null;

  const getBackgroundClass = () => {
    if (!currentWeather) return { class: 'bg-neutral-50', image: null };
    const icon = currentWeather.icon || '';
    if (icon.includes('sun')) return { class: '', image: '/backgrounds/sun.svg' };
    if (icon.includes('rain') || icon.includes('cloud-rain'))
      return { class: '', image: '/backgrounds/rain.svg' };
    if (icon.includes('snow') || icon.includes('cloud-snow'))
      return { class: '', image: '/backgrounds/snow.svg' };
    if (icon.includes('fog') || icon.includes('cloud-fog'))
      return { class: '', image: '/backgrounds/fog.svg' };
    if (icon.includes('lightning') || icon.includes('cloud-lightning'))
      return { class: '', image: '/backgrounds/thunder.svg' };
    return { class: '', image: '/backgrounds/sun.svg' };
  };

  const bg = getBackgroundClass();

  return (
    <main
      className={`min-h-screen py-8 px-4 md:px-8 lg:px-16 ${bg.class || ''}`}
      style={
        bg.image
          ? {
            backgroundImage: `url(${bg.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
          : undefined
      }
    >
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Weather App
          </h1>
          <p className="text-gray-600 text-lg">
            Beautiful real-time weather for your location
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <Link href="/settings">
              <div className="text-sm text-blue-600 underline">Settings</div>
            </Link>
            {session?.user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{session.user.email}</span>
                <Button size="sm" variant="outline" onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => signIn()}>
                Sign in
              </Button>
            )}
          </div>
        </motion.div>

        {/* Controls: unit, forecast days, theme, manual refresh */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Button size="sm" onClick={() => toggleUnit()}>
            Unit: {unit === 'c' ? '°C' : '°F'}
          </Button>

          <div>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Forecast days</label>
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(parseInt(e.target.value, 10))}
              className="px-3 py-2 rounded border"
            >
              {[3, 5, 7, 10, 14].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (latitude && longitude) fetchWeather(latitude, longitude);
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isSearching || loading}
              className="px-6"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button
              type="button"
              onClick={getGeolocation}
              disabled={isLoadingLocation || loading}
              variant="outline"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </motion.form>

        {/* Search Results */}
        {results.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {results.map((result) => (
              <motion.button
                key={result.id}
                onClick={() => handleSelectCity(result)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-4 text-left hover:bg-blue-50 cursor-pointer transition-colors">
                  <h3 className="font-semibold">{result.name}</h3>
                  <p className="text-sm text-gray-600">
                    {result.admin1 && `${result.admin1}, `}
                    {result.country}
                  </p>
                </Card>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Favorites */}
        <div className="mb-8">
          <FavoritesList />
        </div>

        {/* Current Weather Display */}
        {loading && <LoadingAnimation />}

        {currentWeather && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 bg-linear-to-br from-blue-500 to-blue-600 text-white mb-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>

              <motion.div
                className="relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="mb-6">
                  <h2 className="text-5xl font-bold">{currentWeather.city}</h2>
                  <p className="text-blue-100 text-lg">{currentWeather.country}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="text-7xl font-bold mb-4">
                      {currentWeather.temperature}°C
                    </div>
                    <p className="text-blue-100 text-xl mb-3">
                      {currentWeather.description}
                    </p>
                    <p className="text-blue-100">
                      Feels like {currentWeather.feelsLike}°C
                    </p>
                  </div>

                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="flex items-center justify-center"
                  >
                    <div className="text-9xl opacity-30">☀️</div>
                  </motion.div>
                </div>
              </motion.div>
            </Card>

            {/* Map */}
            <div className="my-6">
              <MapView lat={currentWeather.latitude} lng={currentWeather.longitude} zoom={9} />
            </div>

            {/* Weather Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, staggerChildren: 0.1 }}
            >
              {[
                {
                  label: 'Humidity',
                  value: `${currentWeather.humidity}%`,
                  icon: '💧',
                },
                {
                  label: 'Wind Speed',
                  value: `${currentWeather.windSpeed} km/h`,
                  icon: '💨',
                },
                {
                  label: 'Sunrise',
                  value: new Date(currentWeather.sunrise).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  icon: '🌅',
                },
                {
                  label: 'Sunset',
                  value: new Date(currentWeather.sunset).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  icon: '🌆',
                },
              ].map((stat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.1 }}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold mt-2">{stat.value}</p>
                      </div>
                      <div className="text-4xl">{stat.icon}</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            {/* UV Chart (if available) */}
            <div className="mt-6">
              <UVChart />
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
