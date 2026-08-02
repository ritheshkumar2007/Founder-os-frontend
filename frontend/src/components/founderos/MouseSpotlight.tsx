import React, { useEffect, useState } from "react";

export const MouseSpotlight: React.FC = () => {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (position.x < 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-60"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(79, 140, 255, 0.08), transparent 80%)`,
      }}
    />
  );
};
