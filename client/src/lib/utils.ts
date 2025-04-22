import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Default coordinates for Ethiopia (Addis Ababa)
export const DEFAULT_COORDINATES = {
  lat: 9.0079232, 
  lng: 38.7678208
};

export interface GeolocationResult {
  coords: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  source: 'device' | 'fallback' | 'user-provided';
}

// Options for the geolocation request
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,  // 10 seconds
  maximumAge: 300000 // 5 minutes
};

// Get the user's location with fallback
export const getUserLocation = (
  successCallback: (position: GeolocationResult) => void,
  errorCallback?: (error: any) => void
): (() => void) => {
  let watchId: number | null = null;
  
  // Try to get the user's location
  if (navigator.geolocation) {
    try {
      watchId = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          const result: GeolocationResult = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            timestamp: position.timestamp,
            source: 'device'
          };
          
          // Save to localStorage as a backup
          localStorage.setItem('gebeta_last_location', JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
          }));
          
          successCallback(result);
        },
        (error) => {
          console.error('Error getting location:', error);
          
          // Try to get the location from localStorage
          const savedLocation = localStorage.getItem('gebeta_last_location');
          if (savedLocation) {
            try {
              const parsed = JSON.parse(savedLocation);
              const result: GeolocationResult = {
                coords: {
                  latitude: parsed.latitude,
                  longitude: parsed.longitude
                },
                timestamp: parsed.timestamp,
                source: 'fallback'
              };
              successCallback(result);
              return;
            } catch (e) {
              console.error('Error parsing saved location:', e);
            }
          }
          
          // Use default location as last resort
          const result: GeolocationResult = {
            coords: {
              latitude: DEFAULT_COORDINATES.lat,
              longitude: DEFAULT_COORDINATES.lng
            },
            timestamp: Date.now(),
            source: 'fallback'
          };
          successCallback(result);
          
          if (errorCallback) {
            errorCallback(error);
          }
        },
        GEOLOCATION_OPTIONS
      );
    } catch (error) {
      console.error('Exception while initializing geolocation:', error);
      
      // Use default location as fallback
      const result: GeolocationResult = {
        coords: {
          latitude: DEFAULT_COORDINATES.lat,
          longitude: DEFAULT_COORDINATES.lng
        },
        timestamp: Date.now(),
        source: 'fallback'
      };
      successCallback(result);
      
      if (errorCallback) {
        errorCallback(error);
      }
    }
  } else {
    // Geolocation not supported
    console.warn('Geolocation is not supported by this browser');
    
    // Use default location
    const result: GeolocationResult = {
      coords: {
        latitude: DEFAULT_COORDINATES.lat,
        longitude: DEFAULT_COORDINATES.lng
      },
      timestamp: Date.now(),
      source: 'fallback'
    };
    successCallback(result);
    
    if (errorCallback) {
      errorCallback(new Error('Geolocation not supported'));
    }
  }
  
  // Return a cleanup function
  return () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  };
};

// Calculate distance between coordinates in kilometers
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate delivery price based on distance
export function calculateDeliveryPrice(distanceKm: number): number {
  // Based on requirements:
  // 5KM: 250ETB
  // 10-20KM: 345ETB
  if (distanceKm <= 5) {
    return 250;
  } else if (distanceKm <= 10) {
    // Linear interpolation between 5km and 10km
    return 250 + ((345 - 250) / 5) * (distanceKm - 5);
  } else if (distanceKm <= 20) {
    return 345;
  } else {
    // Add extra fee for distances over 20km
    return 345 + 15 * (distanceKm - 20);
  }
}

// Format date to readable format
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format currency (ETB)
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} ETB`;
}
