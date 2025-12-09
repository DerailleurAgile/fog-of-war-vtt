// src/components/Controls/Header.jsx

/**
 * Header component containing title, connection status, and all controls
 */
window.Header = ({ 
  connected,
  sessionCode,
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
  onReset,
  onLeaveSession
}) => {
  const { useState } = React;
  const GMControls = window.GMControls;
  const ZoomControls = window.ZoomControls;
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setShowCopiedNotification(true);
    setTimeout(() => setShowCopiedNotification(false), 2000);
  };

  return (
    <div className="bg-gray-900 text-white text-sm border-b border-gray-2 border-gray-700">
      <div className="px-3 py-2 flex flex-col gap-2">
        {/* Row 1: Title + Connection + Leave */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">Fog of War VTT</h1>
            
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-800 rounded-full text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{connected ? 'ON' : 'OFF'}</span>
            </div>

            {sessionCode && (
              <div className="text-xs font-mono bg-blue-900 px-2 py-0.5 rounded border border-blue-800 truncate max-w-24">
                {sessionCode}
                <button
                  onClick={copySessionCode}
                  className="ml-1 text-blue-300 hover:text-blue-100"
                  title="Copy"
                >
                  copy
                </button>
              </div>
            )}
          </div>

          {sessionCode && (
            <button
              onClick={onLeaveSession}
              className="text-xs text-red-400 hover:text-red-300 px-2"
            >
              Leave
            </button>
          )}
        </div>

        {/* Row 2: Controls – compact and wrap nicely */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
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
          </div>

          <div className="flex items-center gap-2">
            <ZoomControls zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
            <button
              onClick={onReset}
              className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-xs font-medium flex items-center gap-1"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Optional: Copy notification */}
        {showCopiedNotification && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded text-xs animate-pulse">
            Copied!
          </div>
        )}
      </div>
    </div>
  );
};
console.log('✅ Header component loaded');