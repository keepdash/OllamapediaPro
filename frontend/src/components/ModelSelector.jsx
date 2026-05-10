function ModelSelector({ models, selectedModel, onModelChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
          Inference Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-[var(--border)] dark:border-gray-700 rounded-lg bg-white dark:bg-[#2a2b34] text-gray-900 dark:text-gray-100 text-sm transition-colors focus:border-[var(--accent-border)] hover:border-[var(--accent-border)]"
        >
          <option value="">Choose a model...</option>
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
      {selectedModel && (
        <div className="flex items-center gap-2 text-xs text-[var(--accent)] bg-[var(--accent-bg)] px-3 py-2 rounded-lg font-mono shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          {selectedModel}
        </div>
      )}
    </div>
  );
}

export default ModelSelector;
