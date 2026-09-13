import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export default function StarRating({
  rating,
  reviewCount,
  size = 14,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-[#ffa41c]">
        {Array.from({ length: 5 }).map((_, index) => {
          if (index < fullStars) {
            return <Star key={index} size={size} fill="currentColor" />;
          }

          if (index === fullStars && hasHalfStar) {
            return <StarHalf key={index} size={size} fill="currentColor" />;
          }

          return (
            <Star key={index} size={size} className="text-zinc-300" />
          );
        })}
      </div>

      {reviewCount !== undefined && (
        <span className="text-xs text-[#007185] hover:underline">
          {reviewCount.toLocaleString("en-IN")}
        </span>
      )}
    </div>
  );
}
