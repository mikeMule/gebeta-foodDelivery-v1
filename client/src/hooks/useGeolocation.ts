import { useState, useEffect } from 'react';
import { getUserLocation, GeolocationResult, DEFAULT_COORDINATES } from '@/lib/utils';

interface UseGeolocationOptions {
  watchPosition?: boolean;
  skipIfLocationSaved?: boolean;
}

interface UseGeolocationResult {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
  source: GeolocationResult['source'] | null;
  timestamp: number | null;
  getLocationName: (latitude: number, longitude: number) => Promise<string>;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationResult {
  const { watchPosition = true, skipIfLocationSaved = false } = options;
  
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<GeolocationResult['source'] | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);

  // If we want to skip getting location if we have it saved
  useEffect(() => {
    if (skipIfLocationSaved) {
      const savedLocation = localStorage.getItem('gebeta_last_location');
      if (savedLocation) {
        try {
          const parsed = JSON.parse(savedLocation);
          if (parsed.latitude && parsed.longitude) {
            setLocation({
              latitude: parsed.latitude,
              longitude: parsed.longitude
            });
            setSource('fallback');
            setTimestamp(parsed.timestamp || Date.now());
            setIsLoading(false);
            return; // Skip the rest of the effect
          }
        } catch (e) {
          console.error('Error parsing saved location:', e);
        }
      }
    }
    
    // If we don't have a saved location or we're not skipping, proceed with getting the location
    setIsLoading(true);
    
    const cleanup = getUserLocation(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setSource(position.source);
        setTimestamp(position.timestamp);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error('Geolocation error in hook:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        
        // Set default location if error
        if (!location) {
          setLocation({
            latitude: DEFAULT_COORDINATES.lat,
            longitude: DEFAULT_COORDINATES.lng
          });
          setSource('fallback');
          setTimestamp(Date.now());
        }
      }
    );
    
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [watchPosition, skipIfLocationSaved]);

  // Function to get location name from coordinates using our geocoding endpoint
  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch location name: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for both field names for backward compatibility
      if (data && data.locationName) {
        return data.locationName;
      }
      if (data && data.name) {
        return data.name;
      }
      
      console.log('Actual coordinates:', latitude, longitude);
      console.log('Location name:', data.locationName || 'Unknown');
      
      return data.locationName || 'Unknown location';
    } catch (error) {
      console.error('Error fetching location name:', error);
      return 'Unknown location';
    }
  };

  return {
    location,
    isLoading,
    error,
    source,
    timestamp,
    getLocationName
  };
}