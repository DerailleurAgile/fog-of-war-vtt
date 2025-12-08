// src/components/Controls/ZoomControls.jsx

/**
 * Zoom controls component for adjusting viewport zoom level
 */
window.ZoomControls = ({ zoom, onZoomIn, onZoomOut }) => {
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={onZoomOut}
        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        title="Zoom Out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>
      <span className="text-gray-300 text-sm w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button 
        onClick={onZoomIn}
        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        title="Zoom In"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>
    </div>
  );
};

console.log('✅ ZoomControls component loaded');