'use client'

interface RatingBadgeProps {
  rating: number // Average rating from 0-5
  className?: string
}

export function RatingBadge({ rating, className = "" }: RatingBadgeProps) {
  // Determine color based on rating
  const getColor = (rating: number) => {
    if (rating >= 4.5) return "#00C853" // Excellent - Green
    if (rating >= 3.5) return "#FFC107" // Good - Yellow/Amber
    if (rating >= 2.5) return "#FF9800" // Fair - Orange
    if (rating >= 1.5) return "#FF5722" // Poor - Deep Orange
    return "#F44336" // Very Poor - Red
  }

  const color = getColor(rating)
  const displayRating = Math.round(rating * 10) / 10 // Round to 1 decimal

  return (
    <div className={`flex items-center gap-1 text-white ${className}`}>
      <svg width="20" height="20" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        {/* Shield outline with rating-based color */}
        <path d="M32 2 L60 14 V32 C60 46 48 58 32 62 C16 58 4 46 4 32 V14 Z" 
              fill={color} 
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="1"/>
        
        {/* Star in center */}
        <g transform="translate(22,18) scale(0.6)">
          <polygon points="16,2 19,12 30,12 21,19 24,30 16,23 8,30 11,19 2,12 13,12"
                   fill="white"/>
        </g>
      </svg>
      <span className="text-sm font-medium text-yellow-400">
        {displayRating}
      </span>
    </div>
  )
}
