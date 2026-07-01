import React from 'react';

const Logo = ({ className = '', size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const currentTextSize = textSizes[size] || textSizes.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon SVG */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentSize} shrink-0 filter drop-shadow-[0_2px_8px_rgba(0,190,155,0.15)]`}
      >
        <defs>
          <mask id="triangle-cutout">
            <rect width="100" height="100" fill="white" />
            {/* Inner cutout triangle */}
            <path d="M50 56 L65 80 H35 Z" fill="black" />
          </mask>
        </defs>

        {/* Coral dot balancing on top */}
        <circle cx="50" cy="18" r="8.5" fill="#FF5E5B" />

        {/* Teal outer rounded triangle */}
        <path
          d="M50 32 L83 83 C85.5 87 82.5 91 78 91 H22 C17.5 91 14.5 87 17 83 L50 32 Z"
          fill="#00BE9B"
          mask="url(#triangle-cutout)"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <span className={`${currentTextSize} font-bold tracking-tight font-sans`}>
          <span className="text-[#00BE9B]">Tetra</span>
          <span className="text-[#0D2149] dark:text-white transition-colors duration-200">Hire</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
