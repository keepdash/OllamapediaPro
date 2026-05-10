function CitationPanel({ sources, selectedSource, onSelect }) {
  return (
    <div className="mb-4 border border-[var(--border)] rounded-xl overflow-hidden bg-white dark:bg-[#1e1f28] shadow-sm">
      <div className="px-4 py-3 bg-gradient-to-r from-[var(--accent-bg)] to-transparent border-b border-[var(--border)]">
        <div className="text-sm font-semibold text-[var(--text-h)] tracking-wide">
          Sources
          {sources.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
              ({sources.length})
            </span>
          )}
        </div>
      </div>
      {sources.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <p>Ask a question to see cited sources</p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {sources.map((source, index) => (
            <li
              key={source.link || source.title}
              className={`flex flex-col gap-3 px-4 py-3 transition-colors cursor-pointer
                ${selectedSource?.link === source.link
                  ? 'bg-[var(--accent-bg)]'
                  : 'hover:bg-gray-50 dark:hover:bg-[#2a2b34]'
                }`}
              onClick={() => onSelect(source)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm text-[var(--text-h)] truncate">
                    {index + 1}. {source.title}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
                    {source.link}
                  </div>
                </div>
                <a
                  href={`http://localhost${source.link}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] border border-[var(--border)] dark:border-gray-700 transition-colors"
                >
                  Open
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CitationPanel;
