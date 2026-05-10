import { useState } from 'react';
import { askQuestion } from '../services/api';

function AskForm({ selectedModel, onToken, onNewQuestion }) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedModel) return;

    setIsLoading(true);
    onNewQuestion(question);
    await askQuestion(question, selectedModel, onToken);
    setIsLoading(false);
    setQuestion('');
  };

  const isDisabled = isLoading || !question.trim() || !selectedModel;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!selectedModel && (
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          Please select a model before typing your question.
        </div>
      )}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={selectedModel ? "Ask about anything -- from quantum entanglement to the history of the printing press..." : "Select a model to begin..."}
        className={`w-full px-4 py-3 border rounded-xl text-base leading-relaxed resize-none transition-all duration-200
          border-[var(--border)] bg-[#2a2b34] text-white
          dark:border-gray-700 dark:bg-[#1f2028] dark:text-white focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-bg)]
          ${!selectedModel ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        rows={3}
        disabled={!selectedModel || isLoading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {selectedModel ? `Using: ${selectedModel}` : 'Select a model to begin'}
        </span>
        <div className="flex items-center gap-3">
          {selectedModel && (
            <button
              type="button"
              onClick={onNewQuestion}
              disabled={isLoading}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={isDisabled}
            className={`
              inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white text-sm
              transition-all duration-200
              ${isDisabled
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-[var(--accent)] to-[#8b2fcf] hover:from-[#9a4fe8] hover:to-[#7b22be] shadow-md hover:shadow-lg'
              }
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Asking...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Ask
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AskForm;
