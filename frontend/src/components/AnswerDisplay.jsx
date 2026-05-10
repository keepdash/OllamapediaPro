import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

function AnswerDisplay({ answer }) {
  const answerRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  const normalizedAnswer = useMemo(() => {
    if (!answer) return "";
    return answer
      // 1. Force a space after # if the model forgot it (e.g., '##Title' -> '## Title')
      .replace(/^(#+)([^#\s])/gm, '$1 $2')
      // 2. Ensure every header has TWO newlines before it so it doesn't "stick" to the paragraph above
      .replace(/([^\n])\n*(#+ )/g, '$1\n\n$2')
      // 3. Fix paragraph stacking: if there are only single newlines, turn them into double newlines
      .replace(/(?<!\n)\n(?!\n)/g, '\n\n');
  }, [answer]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#1e1f28] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-4 py-2 border-b border-[var(--border)] flex items-center justify-between bg-gray-50 dark:bg-[#1a1b24]">
        <h3 className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-widest !m-0">
          Ollamapedia Output
        </h3>
        {answer && (
          <button onClick={handleCopy} className="text-[10px] text-gray-400 hover:text-[var(--accent)] uppercase font-bold">
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      <div
        ref={answerRef}
        className="p-6 overflow-y-auto text-gray-700 dark:text-gray-300 font-sans"
        style={{ 
          scrollbarWidth: 'thin',
          fontSize: '15px', 
          lineHeight: '1.8' 
        }}
      >
        {!answer ? (
          <span className="text-gray-400 italic text-sm">Generating knowledge...</span>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // These explicit styles override your global index.css rules[cite: 6]
              p: ({node, ...props}) => <p style={{ marginBottom: '1.25rem', display: 'block' }} {...props} />,
              h1: ({node, ...props}) => <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.75rem', display: 'block', color: 'var(--text-h)' }} {...props} />,
              h2: ({node, ...props}) => <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1.25rem', marginBottom: '0.75rem', display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: '4px', color: 'var(--text-h)' }} {...props} />,
              h3: ({node, ...props}) => <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem', display: 'block', color: 'var(--text-h)' }} {...props} />,
              ul: ({node, ...props}) => <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
              // Fix for equation container spacing
              div: ({node, ...props}) => <div style={{ margin: '1.5rem 0', maxWidth: '100%', overflowX: 'auto' }} {...props} />
            }}
          >
            {normalizedAnswer}
          </ReactMarkdown>
        )}
        {answer && <span className="inline-block w-1.5 h-4 bg-[var(--accent)] ml-1 animate-pulse align-middle" />}
      </div>
    </div>
  );
}

export default AnswerDisplay;