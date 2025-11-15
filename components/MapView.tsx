"use client";

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocationStore } from '@/store/locationStore';

interface FavoriteItem {
  id: string;
  city: string;
  country?: string | null;
  latitude: number;
  longitude: number;
}


interface MapViewProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export default function MapView({ lat, lng, zoom = 10 }: MapViewProps) {
  const { data: session } = useSession();
  const { setLocation, setCityCountry } = useLocationStore();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  useEffect(() => {
    // Dynamically import Leaflet only on the client to avoid SSR issues
    import('leaflet').then(() => {
      try {
        // Fix default icon paths when using bundlers by pointing to CDN
        const L = (window as any).L;
        if (L?.Icon?.Default?.prototype) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl:
              'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });
        }
      } catch (e) {
        // ignore if leaflet not available at runtime
        // eslint-disable-next-line no-console
        console.warn('Leaflet icon patch failed', e);
      }
    });
  }, []);

  useEffect(() => {
    // load favorites when session exists
    if (!session?.user) {
      setFavorites([]);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/favorites');
        if (!mounted) return;
        if (res.status === 401) {
          setFavorites([]);
          return;
        }
        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch favorites', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [session]);

  return (
    <div className="w-full h-64 rounded overflow-hidden">
      <MapContainer center={[lat, lng]} zoom={zoom} className="w-full h-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]}>
          <Popup>Current location</Popup>
        </Marker>
        {favorites.map((f) => (
          <Marker
            key={f.id}
            position={[f.latitude, f.longitude]}
            eventHandlers={{
              click: () => {
                setLocation(f.latitude, f.longitude);
                setCityCountry(f.city, f.country || '');
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{f.city}</div>
                <div className="text-xs text-gray-600">{f.country}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
