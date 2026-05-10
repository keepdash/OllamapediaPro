function ThinkingAccordion({ keywords, articles, isOpen, onToggle }) {
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-white dark:bg-[#1e1f28] shadow-sm">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[var(--accent-bg)] to-transparent border-b border-[var(--border)] hover:from-[var(--accent-border)] hover:from-opacity-15 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-[var(--text-h)] flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          {isOpen ? 'Hide' : 'Show'} Thinking Process
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 space-y-4">
          {keywords.length > 0 && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Extracted Keywords
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] border-opacity-30"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          {articles.length > 0 && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Relevant Articles
              </div>
              <ul className="space-y-1.5">
                {articles.map((title, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" />
                    </svg>
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ThinkingAccordion;
