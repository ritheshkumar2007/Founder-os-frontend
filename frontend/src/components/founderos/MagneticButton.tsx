import React, { useRef, useState } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className = "", onClick }) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Magnetic pull strength (max 8px translation)
    setTransform({
      x: distanceX * 0.18,
      y: distanceY * 0.18,
    });
  };

  const handleMouseLeave = () => {
    setTransform({ x: 0, y: 0 });
  };

  return (
    <div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`inline-block transition-transform duration-200 ease-out cursor-pointer ${className}`}
      style={{
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }}
    >
      {children}
    </div>
  );
};
