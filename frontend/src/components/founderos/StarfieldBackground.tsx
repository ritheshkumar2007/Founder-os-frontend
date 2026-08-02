import React from "react";

export const StarfieldBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#080A0F]">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-radial-aurora opacity-70 blur-[120px]" />
      
      {/* OS Structural Grid Layer */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Soft Vignette Mask */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#080A0F]/50 to-[#080A0F]" />
    </div>
  );
};
