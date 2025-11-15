'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Cloud, CloudRain, Sun } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface ForecastItem {
  date: string;
  tempMax: number;
  tempMin: number;
  uvIndexMax?: number | null;
}

interface ForecastProps {
  forecast: ForecastItem[];
}

export function Forecast({ forecast }: ForecastProps) {
  const forecastDays = useUIStore((s) => s.forecastDays);
  const unit = useUIStore((s) => s.unit);

  const toDisplayTemp = (celsius: number) =>
    unit === 'c' ? Math.round(celsius) : Math.round(celsius * 1.8 + 32);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  const getWeatherIcon = (temp: number) => {
    if (temp > 25) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (temp > 15) return <Cloud className="w-6 h-6 text-gray-400" />;
    return <CloudRain className="w-6 h-6 text-blue-500" />;
  };

  return (
    <motion.div
      className="w-full mt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-2xl font-bold mb-4">{forecastDays}-Day Forecast</h3>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"
        variants={containerVariants}
      >
        {forecast.slice(0, Math.max(1, Math.min(forecastDays, forecast.length))).map((day, idx) => {
          const date = new Date(day.date);
          // Format consistently without toLocaleDateString to avoid hydration mismatch
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const dayName = days[date.getUTCDay()];
          const dayDate = `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;

          return (
            <motion.div
              key={day.date}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                <p className="font-semibold text-sm mb-2">{dayName}</p>
                <p className="text-xs text-gray-600 mb-3">{dayDate}</p>

                <motion.div
                  className="flex justify-center mb-3"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getWeatherIcon(day.tempMax)}
                </motion.div>

                <div className="space-y-1">
                  <p className="text-lg font-bold">{toDisplayTemp(day.tempMax)}°{unit === 'c' ? 'C' : 'F'}</p>
                  <p className="text-sm text-gray-500">{toDisplayTemp(day.tempMin)}°{unit === 'c' ? 'C' : 'F'}</p>
                  {('uvIndexMax' in day) && (
                    <p className="text-xs text-amber-600">UV Max: {day.uvIndexMax ?? '—'}</p>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
