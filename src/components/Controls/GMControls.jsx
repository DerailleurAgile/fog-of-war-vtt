// src/components/Controls/GMControls.jsx

/**
 * GM-only controls component
 * Map upload, GM mode toggle, reveal radius, and torchlight controls
 */
window.GMControls = ({ 
  isGM,
  gmMode,
  setGmMode,
  revealRadiusPercent,
  onRadiusChange,
  gmTorchlight,
  onTorchToggle,
  onImageUpload
}) => {
  if (!isGM) return null;

  return (
    <>
      <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>Upload Map</span>
        <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
      </label>

      <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded cursor-pointer transition-colors">
        <input 
          type="checkbox" 
          checked={gmMode}
          onChange={(e) => setGmMode(e.target.checked)}
          className="w-4 h-4"
        />
        <span>GM Mode (No Fog)</span>
      </label>
      
      <div className="flex items-center gap-2">
        <label className="text-gray-300 text-sm">Reveal Radius:</label>
        <input 
          type="range" 
          min="1" 
          max="25" 
          value={revealRadiusPercent} 
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-gray-300 text-sm min-w-[3rem] text-right">
          {revealRadiusPercent}%
        </span>
      </div>

      <label className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded cursor-pointer transition-colors">
        <input 
          type="checkbox" 
          checked={gmTorchlight}
          onChange={(e) => onTorchToggle(e.target.checked)}
          className="w-4 h-4"
        />
        <span>Show Torchlight Halo</span>
      </label>
    </>
  );
};

console.log('✅ GMControls component loaded');