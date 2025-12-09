// src/components/Lobby.jsx

/**
 * Lobby modal for creating or joining game sessions
 */
window.Lobby = ({ onCreateSession, onJoinSession }) => {
  const { useState } = React;
  const [sessionCode, setSessionCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = () => {
    setIsCreating(true);
    onCreateSession();
  };

  const handleJoinSession = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate 4-digit code
    if (!/^\d{4}$/.test(sessionCode)) {
      setError('Please enter a 4-digit code');
      return;
    }
    
    onJoinSession(sessionCode);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setSessionCode(value);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Fog of War VTT</h1>
          <p className="text-gray-400">Create or join a game session</p>
        </div>

        {/* GM: Create Session */}
        <div className="mb-6">
          <button
            onClick={handleCreateSession}
            disabled={isCreating}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-colors"
          >
            {isCreating ? 'Creating Session...' : 'Create New Session (GM)'}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        {/* Player: Join Session */}
        <form onSubmit={handleJoinSession} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Join Existing Session
            </label>
            <input
              type="text"
              value={sessionCode}
              onChange={handleCodeChange}
              placeholder="Enter 4-digit code"
              className="w-full px-4 py-3 bg-gray-700 text-white text-center text-2xl tracking-widest rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              maxLength="4"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            disabled={sessionCode.length !== 4}
          >
            Join as Player
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-500 text-xs text-center">
            GM creates a session and shares the 4-digit code with players
          </p>
        </div>
      </div>
    </div>
  );
};

console.log('✅ Lobby component loaded');