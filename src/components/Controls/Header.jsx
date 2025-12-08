// src/components/Controls/Header.jsx

/**
 * Header component containing title, connection status, and all controls
 */
window.Header = ({ 
  connected,
  isGM,
  gmMode,
  setGmMode,
  revealRadiusPercent,
  onRadiusChange,
  gmTorchlight,
  onTorchToggle,
  onImageUpload,
  zoom,
  onZoomIn,
  onZoomOut,
  onReset
}) => {
  const GMControls = window.GMControls;
  const ZoomControls = window.ZoomControls;

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Fog of War VTT</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-300">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <GMControls
            isGM={isGM}
            gmMode={gmMode}
            setGmMode={setGmMode}
            revealRadiusPercent={revealRadiusPercent}
            onRadiusChange={onRadiusChange}
            gmTorchlight={gmTorchlight}
            onTorchToggle={onTorchToggle}
            onImageUpload={onImageUpload}
          />

          <ZoomControls
            zoom={zoom}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
          />
          
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

console.log('✅ Header component loaded');