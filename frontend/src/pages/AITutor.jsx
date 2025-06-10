import { useState, useEffect, useRef } from 'react';

function AITutor() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm your AI tutor. What subject or concept would you like to learn about today?" },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = `${import.meta.env.VITE_GEMINI_API_URL}?key=${API_KEY}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const formatResponse = (text) => {
    let cleanText = text
      .replace(/\\+/g, '')
      .replace(/\*\*/g, '<b>')
      .replace(/\n/g, '<br>')
      .replace(/```(\w*)\n([\s\S]*?)\n```/g, '<pre><code>$2</code></pre>');

    cleanText = cleanText.replace(/^(#+)\s*(.+)$/gm, (match, hashes, title) => {
      const level = Math.min(hashes.length, 6);
      return `<h${level}>${title}</h${level}>`;
    });

    cleanText = cleanText.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
    cleanText = cleanText.replace(/(<li>.*<\/li>)/g, (match) => {
      if (!cleanText.includes('<ul>')) {
        return `<ul>${match}</ul>`;
      }
      return match;
    });

    return cleanText;
  };

  const callGeminiAPI = async (prompt, retries = 3) => {
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{
          text: `You are an expert AI tutor specialized in explaining academic concepts to students. 
          Provide detailed, accurate, and comprehensive explanations with examples when appropriate.
          Use proper HTML formatting with headings, lists, tables, and code blocks where needed.
          Break down complex concepts into simpler parts.
          Current question: ${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        topP: 0.9
      }
    };

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          if (response.status === 429 && i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }
          throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
        throw new Error("Invalid API response structure");
      } catch (error) {
        if (i === retries - 1) {
          console.error('API Error:', error);
          throw error;
        }
      }
    }
  };

  const typeBotMessage = async (formattedHTML) => {
    setMessages((prev) => [...prev, { role: 'bot', text: '' }]);
    let i = 0;
    const typingSpeed = 10;
    const chunkSize = 3;

    while (i < formattedHTML.length) {
      const chunkEnd = Math.min(i + chunkSize, formattedHTML.length);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = formattedHTML.substring(0, chunkEnd);
        return newMessages;
      });
      i = chunkEnd;
      scrollToBottom();
      await new Promise((r) => setTimeout(r, typingSpeed));
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: escapeHtml(input) }]);
    setInput('');
    setIsTyping(true);

    try {
      const botResponse = await callGeminiAPI(input);
      await typeBotMessage(formatResponse(botResponse));
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: `❌ Error: ${error.message}` }]);
      console.error("API Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="card">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[var(--text)]">AI Tutor</h2>
          <p className="text-[var(--muted)]">Ask me anything about your subjects</p>
        </div>
        <div className="h-96 overflow-y-auto p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role}`}
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
          ))}
          {isTyping && (
            <div className="flex items-center space-x-2 text-[var(--muted)]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce delay-200"></div>
              </div>
              <p>AI tutor is thinking...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your question..."
            className="flex-grow p-2 border border-[var(--border)] rounded-l-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
            autoComplete="off"
          />
          <button onClick={sendMessage} className="btn-primary rounded-l-none">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AITutor;