// src/components/Controls/Footer.jsx

/**
 * Footer component displaying control instructions
 */
window.Footer = ({ isTouchDevice, gmMode }) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-3">
      <div className="text-gray-300 text-sm text-center">
        <span className="font-semibold">Controls:</span> 
        {isTouchDevice 
          ? ' Tap to move token • Two-finger drag to pan' 
          : ' Arrow Keys or WASD to move • Left Click + Drag to pan'
        } • {gmMode ? 'GM Mode Active - Full map visible' : 'Fog of War Active'}
      </div>
    </div>
  );
};

console.log('✅ Footer component loaded');