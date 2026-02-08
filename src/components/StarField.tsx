"use client";

import { useMemo } from "react";

export function StarField() {
  const stars = useMemo(() => 
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      opacity: Math.random() * 0.7 + 0.3,
      delay: `${Math.random() * 3}s`,
      duration: `${Math.random() * 3 + 2}s`,
    }))
  , []);

  return (
    <div className="star-field">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.width,
            height: star.height,
            opacity: star.opacity,
            animation: `twinkle ${star.duration} infinite ease-in-out ${star.delay}`,
          }}
        />
      ))}
    </div>
  );
}
