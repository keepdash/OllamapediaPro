const API_BASE = 'http://localhost:8001';

export async function getHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    return { ollama: false, kiwix: false, backend: false };
  }
}

export async function getModels() {
  try {
    const response = await fetch(`${API_BASE}/models`);
    if (!response.ok) throw new Error('Models fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Models fetch error:', error);
    return { models: [] };
  }
}

export async function askQuestion(question, model, onToken) {
  try {
    const response = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, model }),
    });

    if (!response.ok) throw new Error('Ask request failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = ""; // The buffer collects partial chunks

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the current chunk and add it to our buffer
      buffer += decoder.decode(value, { stream: true });

      // Split the buffer by newlines to find complete messages
      let lines = buffer.split('\n');

      // The last element of split() is either an empty string (if the chunk ended in \n)
      // or a partial line. We move it back into the buffer for the next iteration[cite: 8].
      buffer = lines.pop();

      for (const line of lines) {
        if (line.trim()) {
          // Process the complete line[cite: 8]
          if (onToken) onToken(line);
        }
      }

      /**
       * Special Case: Ollama Tokens
       * If the backend sends Ollama tokens WITHOUT a newline, they will sit in the buffer.
       * We check if the buffer contains "raw" text (not a DEBUG prefix) and flush it 
       * to keep the streaming UI feeling fast[cite: 8].
       */
      if (buffer && !buffer.startsWith("DEBUG_KEYWORDS:") && !buffer.startsWith("DEBUG_ARTICLES:")) {
        if (onToken) onToken(buffer);
        buffer = ""; // Clear buffer after flushing raw text
      }
    }
  } catch (error) {
    console.error('Ask error:', error);
  }
}