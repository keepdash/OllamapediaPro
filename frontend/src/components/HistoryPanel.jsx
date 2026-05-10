export default function HistoryPanel({ history, onDelete, onLoad, onClearAll }) {
  return (
    <div className="bg-white dark:bg-[#1e1f28] border border-[var(--border)] rounded-xl p-4 flex flex-col shadow-sm h-[320px]">
      {/* Header - Fixed at the top */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-sm font-bold flex items-center gap-2 text-[var(--text-h)]">
          <span>📜 History</span>
          {history.length > 0 && (
            <span className="bg-gray-100 dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full text-gray-500">
              {history.length}
            </span>
          )}
        </h2>
        {history.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-[10px] text-gray-400 hover:text-red-500 uppercase tracking-tighter transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <p className="text-xs text-gray-400 italic">No saved answers yet.</p>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-transparent hover:border-[var(--border)]"
            >
              <button 
                onClick={() => onLoad(item)}
                className="text-left text-xs truncate flex-1 pr-2 text-[var(--text-h)] hover:text-[var(--accent)]"
                title={item.question}
              >
                {item.question}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}