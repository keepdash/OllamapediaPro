import { useState, useEffect, useCallback } from 'react';
import HealthStatus from './components/HealthStatus';
import ModelSelector from './components/ModelSelector';
import AskForm from './components/AskForm';
import HistoryPanel from './components/HistoryPanel';
import AnswerDisplay from './components/AnswerDisplay';
import ThinkingAccordion from './components/ThinkingAccordion';
import CitationPanel from './components/CitationPanel';
import { getModels } from './services/api';

function SourcePreview({ source }) {
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-white dark:bg-[#1e1f28] shadow-sm h-[480px] flex flex-col">
      <div className="px-4 py-3 bg-gradient-to-r from-[var(--accent-bg)] to-transparent border-b border-[var(--border)]">
        <div className="text-sm font-semibold text-[var(--text-h)] tracking-wide">Source Preview</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{source.title}</div>
      </div>
      <iframe
        title="Kiwix source preview"
        src={`http://localhost${source.link}`}
        className="flex-1 w-full"
        loading="lazy"
      />
    </div>
  );
}

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(''); // New state to track current query
  const [selectedModel, setSelectedModel] = useState('');
  const [answer, setAnswer] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [articles, setArticles] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isThinkingOpen, setIsThinkingOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('ollamapedia_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Function to save current session to history
  const saveCurrentToHistory = (question) => {
    if (!answer) return;
  
    const newEntry = {
      id: Date.now(),
      question,
      answer,
      keywords,
      sources,
      timestamp: new Date().toLocaleString()
    };
  
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('ollamapedia_history', JSON.stringify(updatedHistory));
  };

  // Function to delete an item
  const deleteHistoryItem = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('ollamapedia_history', JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    if (window.confirm("Delete all saved history?")) {
      setHistory([]);
      localStorage.removeItem('ollamapedia_history');
    }
  };

  // Function to load a history item back into the UI
  const loadHistoryItem = (item) => {
    // We don't need to checkpoint here if we're just switching between existing history items
    // But if the user was in the middle of a NEW search, we save that first
    if (!activeHistoryId) {
      checkpointCurrentSession();
    }

    setCurrentQuestion(item.question);
    setAnswer(item.answer);
    setKeywords(item.keywords || []);
    setSources(item.sources || []);
    setActiveHistoryId(item.id); // Mark this ID as active so it doesn't duplicate
    if (item.sources?.length > 0) setSelectedSource(item.sources[0]);
  };

  const checkpointCurrentSession = useCallback(() => {
    if (!answer || !currentQuestion) return;

    // 1. If we are currently viewing an item that already has an ID, don't re-save it
    if (activeHistoryId) return;

    // 2. Secondary check: content-based duplicate prevention
    const isDuplicateContent = history.some(item => 
      item.question === currentQuestion && item.answer === answer
    );

    if (!isDuplicateContent) {
      const newEntry = {
        id: Date.now(), // New ID for a brand new search
        question: currentQuestion,
        answer: answer,
        keywords: keywords,
        sources: sources,
        timestamp: new Date().toLocaleString()
      };
    
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('ollamapedia_history', JSON.stringify(updatedHistory));
    
      // Once saved, this session now has an ID
      setActiveHistoryId(newEntry.id);
    }
  }, [answer, currentQuestion, history, keywords, sources, activeHistoryId]);

  useEffect(() => {
    const fetchModels = async () => {
      const data = await getModels();
      setModels(data.models || []);
    };
    fetchModels();
  }, []);

  const handleToken = (token) => {
    if (token.startsWith('DEBUG_KEYWORDS:')) {
      const jsonStr = token.split('DEBUG_KEYWORDS:')[1].trim();
      try {
        setKeywords(JSON.parse(jsonStr));
        setIsThinkingOpen(true);
      } catch (e) {
        console.error(e);
      }
      return;
    }

    if (token.startsWith('DEBUG_ARTICLES:')) {
      const jsonStr = token.split('DEBUG_ARTICLES:')[1].trim();
      try {
        setArticles(JSON.parse(jsonStr));
      } catch (e) {
        console.error(e);
      }
      return;
    }

    if (token.startsWith('DEBUG_SOURCES:')) {
      const jsonStr = token.split('DEBUG_SOURCES:')[1].trim();
      try {
        const parsedSources = JSON.parse(jsonStr);
        setSources(parsedSources);
        if (parsedSources.length > 0) {
          setSelectedSource(parsedSources[0]);
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    setAnswer((prev) => prev + token);
  };

  const handleNewQuestion = (newQ) => {
    checkpointCurrentSession();

    setCurrentQuestion(newQ); // Store the new question
    setActiveHistoryId(null); // Reset ID because this is a new, unsaved search
    setAnswer('');
    setKeywords([]);
    setArticles([]);
    setSources([]);
    setSelectedSource(null);
    setIsThinkingOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 dark:from-[#16171d] dark:to-[#1a1b24]">
      {/* Top Bar: Branding + Health */}
      <div className="border-b border-[var(--border)] bg-white/80 dark:bg-[#16171d]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-[var(--accent)]" aria-hidden="true">
              <use href="#documentation-icon" />
            </svg>
            <div>
              <h1 className="text-xl font-medium tracking-tight text-[var(--text-h)]">
                Ollamapedia <span className="text-[var(--accent)]">Pro</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Offline AI Encyclopedia Assistant</p>
            </div>
          </div>
          {/* Health */}
          <HealthStatus />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.5fr]">
          {/* Tool Panel: Model + Ask */}
          <section className="bg-white dark:bg-[#1e1f28] border border-[var(--border)] rounded-xl shadow-sm p-5 space-y-4">
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
            <AskForm
              selectedModel={selectedModel}
              onToken={handleToken}
              onNewQuestion={handleNewQuestion}
            />
          </section>

          {/* History Panel */}
          <HistoryPanel 
            history={history}
            onDelete={deleteHistoryItem}
            onLoad={loadHistoryItem}
            onClearAll={clearAllHistory}
          />
        </div>

        {/* Thinking Process */}
        {keywords.length > 0 && articles.length > 0 && (
          <ThinkingAccordion
            keywords={keywords}
            articles={articles}
            isOpen={isThinkingOpen}
            onToggle={() => setIsThinkingOpen(!isThinkingOpen)}
          />
        )}

        {/* Citations */}
        <CitationPanel sources={sources} selectedSource={selectedSource} onSelect={setSelectedSource} />

        {/* Results Area */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <AnswerDisplay answer={answer} />
          {selectedSource && <SourcePreview source={selectedSource} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-gray-400 dark:text-gray-600">
        Powered by Ollama and Kiwix &middot; Knowledge at your fingertips
      </footer>
    </div>
  );
}

export default App;
