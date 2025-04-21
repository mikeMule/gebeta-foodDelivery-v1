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
          
          // Use the actual user's current location instead of finding closest predefined location
          const actualLocation = {
            lat: lat,
            lng: lng,
            name: "Your Location"
          };
          
          // Log actual coordinates for debugging
          console.log("Actual coordinates:", lat, lng);
          
          setUserLocation(actualLocation);
          
          // Try to determine location name using our backend proxy to Google Maps API
          try {
            // Call our server-side API that will use the Google Maps API key
            fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
              .then(response => response.json())
              .then(data => {
                if (data && data.locationName) {
                  const locationName = data.locationName;
                  console.log("Location name:", locationName);
                  setLocationName(locationName);
                  
                  // Update the location with the fetched name
                  const namedLocation = {
                    lat: lat,
                    lng: lng,
                    name: locationName
                  };
                  
                  setUserLocation(namedLocation);
                  
                  if (onUserLocationChange) {
                    onUserLocationChange(namedLocation);
                  }
                } else {
                  console.error("Error getting location name from server");
                  setLocationName("Your Location");
                }
              })
              .catch(error => {
                console.error("Error fetching location name:", error);
                setLocationName("Your Location");
              });
          } catch (error) {
            console.error("Error with location name lookup:", error);
            setLocationName("Your Location");
          }
          
          // Calculate distance if restaurant location is provided
          if (restaurantLocation) {
            const dist = calculateDistance(
              lat, 
              lng, 
              restaurantLocation.lat, 
              restaurantLocation.lng
            );
            setDistance(dist);
          }
          
          // Initial callback with actual coordinates
          if (onUserLocationChange) {
            onUserLocationChange(actualLocation);
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
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
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

  // Add state for manual location entry
  const [manualLocation, setManualLocation] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  
  // Function to handle manual location setting
  const handleManualLocationSet = () => {
    if (manualLocation.trim()) {
      const newLocation = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        name: manualLocation.trim()
      };
      
      setLocationName(manualLocation.trim());
      setUserLocation(newLocation);
      
      if (onUserLocationChange) {
        onUserLocationChange(newLocation);
      }
      
      setShowManualInput(false);
    }
  };
  
  return (
    <div className="relative rounded-lg overflow-hidden bg-[#FFF9F2]" style={{ height }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B572A]/5 to-[#8B572A]/15 z-10"></div>
      
      {/* Map background with coordinates displayed */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center z-0">
        <MapIcon className="w-48 h-48 text-[#8B572A]/10" />
        {!isLoading && (
          <div className="absolute top-3 right-3 bg-white/80 rounded-lg px-2 py-1 text-xs text-[#4F2D1F]">
            <div className="font-mono">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B572A]"></div>
            <p className="mt-2 text-sm text-[#4F2D1F]">Detecting your location...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Location marker in center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-15">
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-[#8B572A] flex items-center justify-center p-4 animate-pulse">
                <MapPin className="absolute h-4 w-4 text-white" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#8B572A]/30 absolute -top-2.5 -left-2.5"></div>
            </div>
          </div>
          
          {/* Location info card */}
          <div className="absolute inset-x-0 bottom-0 p-4 z-20">
            <div className="bg-white rounded-lg shadow-md p-3">
              {/* Manual location input */}
              {showManualInput ? (
                <div className="mb-2">
                  <div className="flex items-center mb-1">
                    <MapPin className="h-4 w-4 text-[#8B572A] mr-2" />
                    <div className="text-sm font-medium text-[#4F2D1F]">
                      Enter your location:
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      placeholder="e.g., Bole, Addis Ababa"
                      className="flex-1 text-sm border border-neutral-200 rounded-lg px-2 py-1"
                    />
                    <button
                      onClick={handleManualLocationSet}
                      className="bg-[#8B572A] text-white text-xs px-2 py-1 rounded-lg"
                    >
                      Set
                    </button>
                  </div>
                  <button
                    onClick={() => setShowManualInput(false)}
                    className="text-[#8B572A] text-xs mt-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-[#8B572A] mr-2" />
                  <div className="font-medium text-[#4F2D1F]">
                    Current Location: <span className="text-[#8B572A]">{locationName}</span>
                  </div>
                </div>
              )}
              
              {restaurantLocation && !showManualInput && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 text-[#8B572A]/70 mr-1" />
                    <span className="text-[#4F2D1F]">Distance to {restaurantLocation.name}</span>
                  </div>
                  <span className="font-medium text-[#8B572A]">{distance.toFixed(1)} km</span>
                </div>
              )}
              
              <div className="flex mt-2 gap-2">
                <button 
                  className="flex-1 text-[#8B572A] text-xs flex items-center justify-center bg-[#E5A764]/10 py-1.5 rounded-full"
                  onClick={detectLocation}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  <span>Sync Location</span>
                </button>
                
                {!showManualInput && (
                  <button 
                    className="flex-1 text-[#8B572A] text-xs flex items-center justify-center bg-[#E5A764]/10 py-1.5 rounded-full"
                    onClick={() => {
                      setManualLocation(locationName);
                      setShowManualInput(true);
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Enter Manually</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryMap;