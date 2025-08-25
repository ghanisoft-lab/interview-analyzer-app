// frontend/components/AdBanner.js
import React, { useEffect } from 'react';

/**
 * Renders a Google AdSense ad banner.
 * Needs to be initialized with your AdSense client ID in _document.js.
 * Ensure you replace 'ca-pub-YOUR_ADSENSE_PUBLISHER_ID' in _document.js.
 * @param {object} props - Component props.
 * @param {string} props.slot - The data-ad-slot ID for the specific ad unit.
 * @returns {JSX.Element} The AdSense banner component.
 */
const AdBanner = ({ slot }) => {
  useEffect(() => {
    // Push ad request to Google AdSense
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("Adsense error", e);
    }
  }, [slot]); // Rerun when slot changes

  // Map slot types to common ad sizes for responsive design
  const getAdDimensions = (adSlot) => {
    switch (adSlot) {
      case '728x90': // Top banner
        return {
          width: 'min(100%, 728px)', // Fluid width, max 728px
          height: '90px',
          className: 'mx-auto', // Center horizontally
        };
      case '300x250': // Inline/Small rectangle
        return {
          width: 'min(100%, 300px)',
          height: '250px',
          className: 'mx-auto',
        };
      case '160x600': // Sidebar skyscraper
        return {
          width: 'min(100%, 160px)',
          height: '600px',
          className: 'mx-auto lg:mx-0 lg:ml-auto', // Align right on large screens
        };
      default:
        return {
          width: '100%',
          height: '100px', // Default fallback
          className: 'mx-auto',
        };
    }
  };

  const { width, height, className } = getAdDimensions(slot);

  return (
    <div
      className={`relative bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg shadow-inner border border-gray-200 p-2 ${className}`}
      style={{ minWidth: '100px', minHeight: '50px', width, height }} // Min dimensions for responsiveness
      aria-label={`Advertisement banner ${slot}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }} // Ensure ins element fills container
        data-ad-client="ca-pub-YOUR_ADSENSE_PUBLISHER_ID" // Replace with your AdSense Publisher ID
        data-ad-slot={slot}
        data-ad-format="auto" // Allows AdSense to choose the best size
        data-full-width-responsive="true"
      ></ins>
      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs sm:text-sm font-medium pointer-events-none">
        Advertisement
      </div>
    </div>
  );
};

export default AdBanner;
