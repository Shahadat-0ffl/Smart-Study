import { useState, useEffect } from 'react';

function AIAssessment() {
  const [testConfig, setTestConfig] = useState({
    subject: 'mathematics',
    topic: '',
    difficulty: 'medium',
    questionTypes: ['mcq'],
    questionCount: 5,
  });
  const [currentTest, setCurrentTest] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [view, setView] = useState('config');
  const [testDuration, setTestDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = `${import.meta.env.VITE_GEMINI_API_URL}?key=${API_KEY}`;

  const subjects = [
    'mathematics', 'science', 'history', 'english',
    'computer_science', 'physics', 'biology', 'chemistry'
  ];
  const difficulties = ['easy', 'medium', 'hard'];
  const questionTypes = ['mcq', 'short_answer', 'true_false'];

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setTestConfig((prev) => {
        let newTypes = [...prev.questionTypes];
        if (checked) {
          newTypes.push(value);
        } else {
          newTypes = newTypes.filter((t) => t !== value);
        }
        return { ...prev, questionTypes: newTypes };
      });
    } else {
      setTestConfig((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generateQuestionsWithAI = async () => {
    const { subject, topic, difficulty, questionCount, questionTypes } = testConfig;
    const prompt = `Generate ${questionCount} ${difficulty} difficulty assessment questions about ${subject}${topic ? ' specifically about ' + topic : ''}.
    Include these question types: ${questionTypes.join(', ')}.
    Return the questions in JSON format with this structure:
    [
        {
            "type": "question_type",
            "question": "question text",
            "options": ["array", "of", "options"] (only for mcq and true_false),
            "answer": "correct answer",
            "explanation": "brief explanation of the answer"
        }
    ]
    Ensure the response contains only valid JSON with no additional text.`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000, topP: 0.9 }
    };

    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          if (response.status === 429 && i < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }
          throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        const jsonStart = responseText.indexOf('[');
        const jsonEnd = responseText.lastIndexOf(']') + 1;
        const jsonString = responseText.slice(jsonStart, jsonEnd);

        return JSON.parse(jsonString);
      } catch (error) {
        if (i === 2) {
          console.error('API Error:', error);
          throw error;
        }
      }
    }
  };

  const generateTest = async () => {
    if (testConfig.questionTypes.length === 0) {
      alert('Please select at least one question type');
      return;
    }

    setIsLoading(true);
    try {
      const questions = await generateQuestionsWithAI();
      setCurrentTest(questions);
      setUserAnswers(questions.map((q) => ({
        question: q.question,
        answer: '',
        correctAnswer: q.answer,
        explanation: q.explanation || '',
        isCorrect: null
      })));
      setView('test');
      startTimer();
    } catch (error) {
      console.error('Error generating test:', error);
      alert('Failed to generate test: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTestDuration(elapsed);
    }, 1000);
    setTimerInterval(interval);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (index, value) => {
    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[index].answer = value;
      return newAnswers;
    });
  };

  const gradeTest = () => {
    clearInterval(timerInterval);
    let correctCount = 0;

    const gradedAnswers = userAnswers.map((item, index) => {
      let isCorrect;
      if (currentTest[index].type === 'mcq' || currentTest[index].type === 'true_false') {
        isCorrect = item.answer === item.correctAnswer;
      } else {
        isCorrect = item.answer.toLowerCase() === item.correctAnswer.toLowerCase();
      }
      if (isCorrect) correctCount++;
      return { ...item, isCorrect };
    });

    setUserAnswers(gradedAnswers);
    setView('results');
  };

  const resetTest = () => {
    clearInterval(timerInterval);
    setTestDuration(0);
    setCurrentTest([]);
    setUserAnswers([]);
    setView('config');
  };

  const toggleReviewMode = () => {
    setView('test');
  };

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {view === 'config' && (
        <section className="card">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Configure Your Test</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[var(--muted)] font-medium">Subject:</label>
              <select
                name="subject"
                value={testConfig.subject}
                onChange={handleConfigChange}
                className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[var(--muted)] font-medium">Topic:</label>
              <input
                type="text"
                name="topic"
                value={testConfig.topic}
                onChange={handleConfigChange}
                placeholder="Enter specific topic (e.g., Algebra)"
                className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[var(--muted)] font-medium">Difficulty Level:</label>
              <select
                name="difficulty"
                value={testConfig.difficulty}
                onChange={handleConfigChange}
                className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[var(--muted)] font-medium">Question Types:</label>
              <div className="space-y-2">
                {questionTypes.map((type) => (
                  <label key={type} className="flex items-center text-[var(--text)]">
                    <input
                      type="checkbox"
                      name="question-type"
                      value={type}
                      checked={testConfig.questionTypes.includes(type)}
                      onChange={handleConfigChange}
                      className="mr-2 accent-[var(--primary)]"
                    />
                    {type.replace('_', ' ').toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[var(--muted)] font-medium">Number of Questions:</label>
              <input
                type="number"
                name="questionCount"
                value={testConfig.questionCount}
                onChange={handleConfigChange}
                min="3"
                max="20"
                className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[var(--muted)]">Generating your test questions...</p>
              </div>
            )}
            <button
              onClick={generateTest}
              disabled={isLoading}
              className="btn-primary"
            >
              Generate Test
            </button>
          </div>
        </section>
      )}
      {view === 'test' && (
        <section className="card">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--text)]">
              {testConfig.subject.charAt(0).toUpperCase() + testConfig.subject.slice(1)} Assessment{testConfig.topic ? `: ${testConfig.topic}` : ''}
            </h2>
            <div className="text-[var(--muted)]">Time: {formatTime(testDuration)}</div>
          </div>
          <div className="space-y-6">
            {currentTest.map((q, index) => (
              <div key={index} className="border border-[var(--border)] rounded-lg p-4">
                <div className="font-medium text-[var(--text)] mb-2">{index + 1}. {q.question}</div>
                <div className="space-y-2">
                  {(q.type === 'mcq' || q.type === 'true_false') && q.options?.map((option, i) => (
                    <div key={i} className="flex items-center">
                      <input
                        type="radio"
                        name={`q${index}`}
                        id={`q${index}-o${i}`}
                        value={option}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="mr-2 accent-[var(--primary)]"
                      />
                      <label htmlFor={`q${index}-o${i}`} className="text-[var(--text)]">{option}</label>
                    </div>
                  ))}
                  {q.type === 'short_answer' && (
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={gradeTest} className="btn-primary mt-6">Submit Test</button>
        </section>
      )}
      {view === 'results' && (
        <section className="card">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Test Results</h2>
          <div className="mb-6">
            {(() => {
              const correctCount = userAnswers.filter((a) => a.isCorrect).length;
              const score = Math.round((correctCount / userAnswers.length) * 100);
              const scoreClass = score >= 80 ? 'text-[var(--success)]' : score >= 50 ? 'text-[var(--warning)]' : 'text-[var(--error)]';
              return (
                <div>
                  <div className={`text-3xl font-bold ${scoreClass} mb-2`}>Your Score: {score}%</div>
                  <p className="text-[var(--muted)]">You answered {correctCount} out of {userAnswers.length} questions correctly.</p>
                  <p className="text-[var(--muted)]">Time taken: {formatTime(testDuration)}</p>
                </div>
              );
            })()}
          </div>
          <div className="space-y-4">
            {userAnswers.map((item, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${item.isCorrect ? 'bg-[var(--success)]/10' : 'bg-[var(--error)]/10'} border-[var(--border)]`}
              >
                <p className="text-[var(--text)]"><strong>Question {index + 1}:</strong> {item.question}</p>
                {item.isCorrect ? (
                  <p className="text-[var(--text)]"><strong>Your answer:</strong> {item.answer || 'No answer provided'}</p>
                ) : (
                  <>
                    <p className="text-[var(--text)]"><strong>Your answer:</strong> {item.answer || 'No answer provided'}</p>
                    <p className="text-[var(--text)]"><strong>Correct answer:</strong> {item.correctAnswer}</p>
                  </>
                )}
                {item.explanation && (
                  <p className="text-[var(--muted)]"><strong>Explanation:</strong> {item.explanation}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex space-x-4">
            <button onClick={resetTest} className="btn-primary">Create New Test</button>
            <button onClick={toggleReviewMode} className="btn-secondary">Review Answers</button>
          </div>
        </section>
      )}
    </div>
  );
}

export default AIAssessment;
