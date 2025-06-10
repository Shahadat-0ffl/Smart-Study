import React, { useState, useContext, useEffect, useRef } from 'react';
import AuthContext from '../contexts/AuthContext';
import ThemeContext from '../contexts/ThemeContext';

const AITranslation = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'ja', name: 'Japanese' },
    {code:'as', name : 'Assamese'},
    {code:'hi', name : 'Hindi'},
  ];

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = `${import.meta.env.VITE_GEMINI_API_URL}?key=${API_KEY}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [translatedText]);

  const callGeminiAPI = async (prompt, retries = 3) => {
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert translator. Translate the following text from ${languages.find((lang) => lang.code === sourceLang)?.name || sourceLang} to ${languages.find((lang) => lang.code === targetLang)?.name || targetLang}. Provide the translation in a JSON object with the key "translatedText". Text to translate: "${inputText.replace(/"/g, '\\"')}". Example output: {"translatedText": "Translated result"}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.9,
      },
    };

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          if (response.status === 429 && i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }
          const errorText = await response.text();
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const result = data.candidates[0].content.parts[0].text;
          const cleanedResult = result.replace(/```json\n|\n```/g, '').trim();
          return JSON.parse(cleanedResult);
        }
        throw new Error('Invalid API response structure');
      } catch (error) {
        if (i === retries - 1) {
          console.error('Gemini API Error:', {
            message: error.message,
            attempt: i + 1,
          });
          throw error;
        }
      }
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }
    if (sourceLang === targetLang) {
      setError('Source and target languages must be different');
      return;
    }

    setIsLoading(true);
    setError('');
    setTranslatedText('');

    try {
      const result = await callGeminiAPI(inputText);
      setTranslatedText(result.translatedText);
    } catch (err) {
      const errorMessage =
        err.message.includes('authentication') || err.message.includes('401')
          ? 'Invalid API credentials. Please verify your Gemini API key in Google AI Studio.'
          : err.message || 'Translation failed. Please try again.';
      setError(errorMessage);
      console.error('Translation Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-12 text-[var(--text)]">Please log in to access AI Translation</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="card max-w-3xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[var(--text)] flex items-center gap-2">
            <span className="material-icons text-[var(--accent)]">translate</span>
            AI Translation
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Instantly translate text between languages using AI-powered technology.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Source Language</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Text to Translate</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition h-32 resize-y"
            />
          </div>

          <button
            onClick={handleTranslate}
            disabled={isLoading}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--secondary)]'}`}
          >
            {isLoading ? (
              <>
                <span className="animate-spin material-icons">autorenew</span>
                Translating...
              </>
            ) : (
              <>
                <span className="material-icons">translate</span>
                Translate
              </>
            )}
          </button>

          {error && <div className="text-red-500 text-sm mt-2 animate-fade-in">{error}</div>}

          {translatedText && (
            <div className="mt-6 animate-fade-in">
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Translated Text</label>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-[var(--text)] shadow-inner">
                {translatedText}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default AITranslation;