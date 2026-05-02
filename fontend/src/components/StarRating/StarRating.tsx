import React from 'react';

interface StarRatingProps {
  rating: number; // e.g., 4.5
  maxStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxStars = 5 }) => {
  return (
    <div className="flex text-yellow-500" aria-label={`Rating: ${rating} out of ${maxStars} stars`} role="img">
      {Array.from({ length: maxStars }).map((_, i) => {
        const fillAmount = Math.max(0, Math.min(1, rating - i));
        return (
          <div key={i} className="relative text-sm inline-block">
            {/* Background Empty Star */}
            <span className="material-symbols-outlined text-transparent [-webkit-text-stroke:1px_currentColor] select-none">
              star
            </span>
            {/* Foreground Fill Star */}
            <div 
              className="absolute top-0 left-0 overflow-hidden select-none"
              style={{ width: `${fillAmount * 100}%` }}
            >
              <span className="material-symbols-outlined fill-1">star</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
