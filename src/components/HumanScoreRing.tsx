
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
    const progressOffset = ((100 - score) / 100) * circumference;
    setOffset(progressOffset);
  }, [score, circumference]);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#047857"
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
