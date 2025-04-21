import { useState } from "react";
import { Icons } from "@/lib/icons";
import { motion } from "framer-motion";

interface RatingStarsProps {
  rating: number;
  setRating: (rating: number) => void;
}

const RatingStars = ({ rating, setRating }: RatingStarsProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          className="w-10 h-10 flex items-center justify-center"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {(hoverRating || rating) >= star ? (
            <Icons.starFilled className="text-2xl text-yellow-500" />
          ) : (
            <Icons.star className="text-2xl text-neutral-300" />
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default RatingStars;
