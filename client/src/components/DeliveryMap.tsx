import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, MapIcon } from 'lucide-react';

// Predefined locations in Addis Ababa
const LOCATIONS = {
  bole: { lat: 8.9806, lng: 38.7578, name: "Bole" },
  kality: { lat: 8.9135, lng: 38.7914, name: "Kality" },
  merkato: { lat: 9.0157, lng: 38.7475, name: "Merkato" },
  piassa: { lat: 9.0345, lng: 38.7531, name: "Piassa" },
  // Default to Bole if no location is detected
  default: { lat: 8.9806, lng: 38.7578, name: "Bole" }
};

interface DeliveryMapProps {
  restaurantLocation?: { lat: number; lng: number; name: string };
  onUserLocationChange?: (location: { lat: number; lng: number; name: string }) => void;
  height?: string;
}

const DeliveryMap = ({ 
  restaurantLocation, 
  onUserLocationChange,
  height = '180px' 
}: DeliveryMapProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string }>(LOCATIONS.default);
  const [isLoading, setIsLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>(LOCATIONS.default.name);
  const [distance, setDistance] = useState<number>(0);

  // Function to detect user's location
  const detectLocation = useCallback(() => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Find the closest predefined location
          const closestLocation = findClosestLocation(lat, lng);
          setUserLocation(closestLocation);
          setLocationName(closestLocation.name);
          
          if (onUserLocationChange) {
            onUserLocationChange(closestLocation);
          }
          
          // Calculate distance if restaurant location is provided
          if (restaurantLocation) {
            const dist = calculateDistance(
              closestLocation.lat, 
              closestLocation.lng, 
              restaurantLocation.lat, 
              restaurantLocation.lng
            );
            setDistance(dist);
          }
          
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Bole if location cannot be determined
          setUserLocation(LOCATIONS.default);
          setLocationName(LOCATIONS.default.name);
          
          // Calculate distance if restaurant location is provided
          if (restaurantLocation) {
            const dist = calculateDistance(
              LOCATIONS.default.lat, 
              LOCATIONS.default.lng, 
              restaurantLocation.lat, 
              restaurantLocation.lng
            );
            setDistance(dist);
          }
          
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation(LOCATIONS.default);
      setLocationName(LOCATIONS.default.name);
      
      // Calculate distance if restaurant location is provided
      if (restaurantLocation) {
        const dist = calculateDistance(
          LOCATIONS.default.lat, 
          LOCATIONS.default.lng, 
          restaurantLocation.lat, 
          restaurantLocation.lng
        );
        setDistance(dist);
      }
      
      setIsLoading(false);
    }
  }, [onUserLocationChange, restaurantLocation]);

  // Find the closest predefined location based on latitude and longitude
  const findClosestLocation = (lat: number, lng: number) => {
    let closestLocation = LOCATIONS.default;
    let closestDistance = Number.MAX_VALUE;
    
    Object.values(LOCATIONS).forEach((location) => {
      const distance = calculateDistance(lat, lng, location.lat, location.lng);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestLocation = location;
      }
    });
    
    return closestLocation;
  };

  // Calculate the distance between two points using the Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-neutral-100" style={{ height }}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 z-10"></div>
      
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-0">
        <MapIcon className="w-48 h-48 text-primary/10" />
      </div>
      
      {isLoading ? (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-neutral-600">Detecting your location...</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 p-4 z-20">
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center mb-2">
              <MapPin className="h-5 w-5 text-primary mr-2" />
              <div className="font-medium">Your Location: <span className="text-primary">{locationName}</span></div>
            </div>
            
            {restaurantLocation && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Navigation className="h-4 w-4 text-neutral-500 mr-1" />
                  <span>Distance to {restaurantLocation.name}</span>
                </div>
                <span className="font-medium">{distance.toFixed(1)} km</span>
              </div>
            )}
            
            <button 
              className="mt-2 text-primary text-xs flex items-center justify-center w-full"
              onClick={detectLocation}
            >
              <Navigation className="h-3 w-3 mr-1" />
              <span>Refresh location</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;