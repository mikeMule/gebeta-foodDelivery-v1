import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';

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

const containerStyle = {
  width: '100%',
  borderRadius: '8px',
  overflow: 'hidden'
};

const DeliveryMap = ({ 
  restaurantLocation, 
  onUserLocationChange,
  height = '250px' 
}: DeliveryMapProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string }>(LOCATIONS.default);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>(LOCATIONS.default.name);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

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
          
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Bole if location cannot be determined
          setUserLocation(LOCATIONS.default);
          setLocationName(LOCATIONS.default.name);
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation(LOCATIONS.default);
      setLocationName(LOCATIONS.default.name);
      setIsLoading(false);
    }
  }, [onUserLocationChange]);

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

  // Get directions from restaurant to user's location
  const getDirections = useCallback(() => {
    if (!restaurantLocation || !mapLoaded) return;
    
    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: new google.maps.LatLng(restaurantLocation.lat, restaurantLocation.lng),
        destination: new google.maps.LatLng(userLocation.lat, userLocation.lng),
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Directions request failed: ${status}`);
        }
      }
    );
  }, [userLocation, restaurantLocation, mapLoaded]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  useEffect(() => {
    if (restaurantLocation && userLocation && mapLoaded) {
      getDirections();
    }
  }, [restaurantLocation, userLocation, getDirections, mapLoaded]);

  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  return (
    <div className="relative">
      <div style={{ height, ...containerStyle }}>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''} onLoad={handleMapLoad}>
          <GoogleMap
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={userLocation}
            zoom={13}
          >
            {/* User location marker */}
            <Marker
              position={userLocation}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(40, 40)
              }}
              title="Your Location"
            />
            
            {/* Restaurant location marker (if provided) */}
            {restaurantLocation && (
              <Marker
                position={restaurantLocation}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new google.maps.Size(40, 40)
                }}
                title="Restaurant Location"
              />
            )}
            
            {/* Show directions if available */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#8B572A',
                    strokeWeight: 5
                  }
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
      
      {isLoading ? (
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-neutral-600">Detecting your location...</p>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-3 left-3 bg-white px-3 py-2 rounded-lg shadow-md text-sm flex items-center">
          <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
          <span>Delivering to: <strong>{locationName}</strong></span>
          <button 
            className="ml-2 text-primary text-xs underline"
            onClick={detectLocation}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;