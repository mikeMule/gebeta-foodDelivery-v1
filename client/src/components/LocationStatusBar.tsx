import React, { useState, useEffect } from 'react';
import { MapPin, Wifi, WifiOff } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWebSocketManager, ConnectionState } from '@/lib/WebSocketManager';
import { cn } from '@/lib/utils';

interface LocationStatusBarProps {
  showConnection?: boolean;
  showLocation?: boolean;
  className?: string;
}

export function LocationStatusBar({
  showConnection = true,
  showLocation = true,
  className
}: LocationStatusBarProps) {
  const { connectionState } = useWebSocketManager();
  const { location, isLoading, source } = useGeolocation({ skipIfLocationSaved: true });
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  
  // Update location name when coordinates change
  useEffect(() => {
    if (location && showLocation) {
      const getAndSetLocationName = async () => {
        // Use our utility function from the hook
        const name = await getLocationName(location.latitude, location.longitude);
        setLocationName(name);
      };
      
      getAndSetLocationName();
    }
  }, [location, showLocation]);
  
  // Get location name helper
  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
      if (!response.ok) {
        return 'Location unavailable';
      }
      
      const data = await response.json();
      return data.locationName || data.name || 'Unknown location';
    } catch (error) {
      console.error('Error fetching location name:', error);
      return 'Location error';
    }
  };
  
  // Determine connection status text and icon
  const getConnectionStatus = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return {
          text: 'Connected',
          icon: <Wifi className="h-3 w-3 text-green-600" />,
          className: 'text-green-600 bg-green-50'
        };
      case ConnectionState.CONNECTING:
        return {
          text: 'Connecting...',
          icon: <Wifi className="h-3 w-3 text-amber-600 animate-pulse" />,
          className: 'text-amber-600 bg-amber-50'
        };
      case ConnectionState.DISCONNECTED:
        return {
          text: 'Offline',
          icon: <WifiOff className="h-3 w-3 text-red-600" />,
          className: 'text-red-600 bg-red-50'
        };
      default:
        return {
          text: 'Unknown',
          icon: <WifiOff className="h-3 w-3 text-gray-600" />,
          className: 'text-gray-600 bg-gray-50'
        };
    }
  };
  
  // Determine location status text and icon
  const getLocationStatus = () => {
    if (isLoading) {
      return {
        text: 'Detecting...',
        icon: <MapPin className="h-3 w-3 text-amber-600 animate-pulse" />,
        className: 'text-amber-600 bg-amber-50'
      };
    }
    
    if (!location) {
      return {
        text: 'Location unavailable',
        icon: <MapPin className="h-3 w-3 text-red-600" />,
        className: 'text-red-600 bg-red-50'
      };
    }
    
    // Display different styling based on location source
    if (source === 'device') {
      return {
        text: locationName,
        icon: <MapPin className="h-3 w-3 text-green-600" />,
        className: 'text-green-600 bg-green-50'
      };
    } else {
      return {
        text: locationName,
        icon: <MapPin className="h-3 w-3 text-amber-600" />,
        className: 'text-amber-600 bg-amber-50'
      };
    }
  };
  
  const connectionStatus = getConnectionStatus();
  const locationStatus = getLocationStatus();
  
  return (
    <div className={cn("flex items-center gap-2 text-xs p-1", className)}>
      {showConnection && (
        <div 
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full", 
            connectionStatus.className
          )}
        >
          {connectionStatus.icon}
          <span className="hidden md:inline">{connectionStatus.text}</span>
        </div>
      )}
      
      {showLocation && (
        <div 
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full", 
            locationStatus.className
          )}
        >
          {locationStatus.icon}
          <span className="truncate max-w-[150px]">{locationStatus.text}</span>
        </div>
      )}
    </div>
  );
}