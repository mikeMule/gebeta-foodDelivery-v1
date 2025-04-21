import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "@/lib/icons";
import { type Restaurant } from "@shared/schema";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <Card className="restaurant-card bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md">
      <div className="relative h-48">
        <img 
          src={restaurant.imageUrl} 
          alt={`${restaurant.name} storefront`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white rounded-lg px-2 py-1 text-xs font-medium">
          <div className="flex items-center">
            <Icons.clock className="mr-1 text-primary" />
            <span>{restaurant.deliveryTime}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold font-dm-sans">{restaurant.name}</h3>
          <div className="flex items-center bg-green-50 px-2 py-0.5 rounded">
            <span className="text-sm font-medium text-green-700">{restaurant.rating.toFixed(1)}</span>
            <Icons.star className="text-sm text-yellow-500 ml-1" />
          </div>
        </div>
        <p className="text-neutral-600 text-sm mb-2">{restaurant.categories}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-neutral-600">
            <Icons.mapPin className="mr-1 text-primary" />
            <span>{restaurant.distance.toFixed(1)} km away</span>
          </div>
          <div className="text-sm font-medium">
            <Icons.bike className="mr-1 inline-block" />
            <span>
              {restaurant.deliveryFee === 0 
                ? "Free delivery" 
                : `Birr ${restaurant.deliveryFee}`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;
