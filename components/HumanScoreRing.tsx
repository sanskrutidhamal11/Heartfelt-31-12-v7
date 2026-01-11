import React, { useEffect, useState } from 'react';

interface HumanScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const HumanScoreRing: React.FC<HumanScoreRingProps> = ({ 
  score, 
  size = 120, 
  strokeWidth = 6 
}) => {
  const [offset, setOffset] = useState(0);
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Immediate trigger for the 1.5s animation
    const progressOffset = ((100 - score) / 100) * circumference;
    setOffset(progressOffset);
  }, [score, circumference]);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
        {/* No gradient or filter definitions needed for the ring, using direct color */}
        
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#FFFFFF" /* Pure White background behind the ring */
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Ring in Royal Emerald Green */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#047857" /* Royal Emerald Green */
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          strokeLinecap="round"
        />
      </svg>
      
      <div className="absolute flex flex-col items-center pt-1">
        <span className="text-2xl font-serif-premium font-bold text-black tracking-tight leading-none">
          {score}%
        </span>
      </div>
    </div>
  );
};

export default HumanScoreRing;