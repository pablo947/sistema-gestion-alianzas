import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CitiesData {
  city: string;
  count: number;
  actors: string[];
}

interface ColombiaMapProps {
  data: CitiesData[];
}

// Colombian cities coordinates
const colombianCities: Record<string, [number, number]> = {
  'Bogotá': [-74.0721, 4.7110],
  'Medellín': [-75.5812, 6.2442],
  'Cali': [-76.5225, 3.4516],
  'Barranquilla': [-74.7813, 10.9639],
  'Cartagena': [-75.5144, 10.3932],
  'Bucaramanga': [-73.1198, 7.1253],
  'Pereira': [-75.6906, 4.8087],
  'Santa Marta': [-74.1990, 11.2408],
  'Ibagué': [-75.2319, 4.4389],
  'Cucuta': [-72.4967, 7.8939],
  'Villavicencio': [-73.6350, 4.1420],
  'Manizales': [-75.5144, 5.0703],
  'Neiva': [-75.2819, 2.9273],
  'Pasto': [-77.2813, 1.2136],
  'Armenia': [-75.6812, 4.5339],
  'Montería': [-75.8814, 8.7479],
  'Sincelejo': [-75.3976, 9.3047],
  'Valledupar': [-73.2532, 10.4631],
  'Popayán': [-76.6063, 2.4448],
  'Tunja': [-73.3674, 5.5353]
};

export const ColombiaMap = ({ data }: ColombiaMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.0721, 4.7110], // Colombia center
      zoom: 5,
    });

    map.current.on('load', () => {
      setIsMapReady(true);
      addMarkers();
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  };

  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const addMarkers = () => {
    if (!map.current || !isMapReady) return;

    // Clear existing markers properly
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    data.forEach(cityData => {
      const coordinates = colombianCities[cityData.city];
      if (coordinates) {
        // Create a custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'city-marker';
        markerElement.style.cssText = `
          width: 28px;
          height: 28px;
          background-color: hsl(var(--primary));
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
          pointer-events: auto;
        `;
        markerElement.textContent = cityData.count.toString();

        // Create popup content
        const popupContent = `
          <div style="padding: 12px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #333; font-size: 14px;">${cityData.city}</h4>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;"><strong>${cityData.count}</strong> ${cityData.count === 1 ? 'actor' : 'actores'}</p>
            <div style="max-height: 150px; overflow-y: auto; border-top: 1px solid #eee; padding-top: 8px;">
              ${cityData.actors.map(actor => `<div style="font-size: 11px; padding: 3px 0; color: #444; border-bottom: 1px solid #f0f0f0; margin-bottom: 2px;">${actor}</div>`).join('')}
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 15,
          closeButton: false,
          closeOnClick: false,
          className: 'city-popup'
        }).setHTML(popupContent);

        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat(coordinates)
          .setPopup(popup);

        // Add hover events for scaling effect
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.2)';
          popup.addTo(map.current!);
        });
        
        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
          popup.remove();
        });

        marker.addTo(map.current!);
        markersRef.current.push(marker);
      }
    });
  };

  useEffect(() => {
    if (mapboxToken && !map.current) {
      initializeMap();
    }
  }, [mapboxToken]);

  useEffect(() => {
    if (isMapReady && data.length > 0) {
      // Add a small delay to ensure map is fully ready
      const timer = setTimeout(() => {
        addMarkers();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data, isMapReady]);

  useEffect(() => {
    return () => {
      // Clean up markers before removing map
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, []);

  if (!mapboxToken) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center">
          <h4 className="font-semibold mb-2">Configuración de Mapbox</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Para mostrar el mapa de Colombia, ingresa tu token público de Mapbox.
            Puedes obtenerlo en <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mapbox-token">Token Público de Mapbox</Label>
          <Input
            id="mapbox-token"
            type="text"
            placeholder="pk.eyJ1..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <Button 
            onClick={initializeMap}
            disabled={!mapboxToken}
            className="w-full"
          >
            Cargar Mapa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};