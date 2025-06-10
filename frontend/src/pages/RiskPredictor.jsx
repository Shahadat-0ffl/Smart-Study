
import { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';

function RiskPredictor() {
  const [view, setView] = useState('input');
  const [studentData, setStudentData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('No file selected');
  const [subjects, setSubjects] = useState([{ subject: '', obtained: '', total: '', passing: '' }]);
  const [recommendations, setRecommendations] = useState('');
  const chartRef = useRef(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = `${import.meta.env.VITE_GEMINI_API_URL}?key=${API_KEY}`;

  const parseMarksheetWithAI = async (text) => {
    const prompt = `Extract student subject marks data from this text in JSON format:
    ${text}
    
    Return a valid JSON array with this structure for each subject:
    [
        {
            "subject": "subject name",
            "obtained": number,
            "total": number,
            "passing": number
        }
    ]
    If any field is missing, try to infer reasonable values.`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
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

  const handleImageUpload = async (e) => {
    if (!e.target.files.length) return;

    const file = e.target.files[0];
    setFileName(`Selected file: ${file.name}`);
    setIsLoading(true);

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      const parsedData = await parseMarksheetWithAI(text);
      setStudentData(parsedData);
      await analyzeData(parsedData);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process the image: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInputChange = (index, field, value) => {
    setSubjects((prev) => {
      const newSubjects = [...prev];
      newSubjects[index] = { ...newSubjects[index], [field]: value };
      return newSubjects;
    });
  };

  const addSubject = () => {
    setSubjects((prev) => [...prev, { subject: '', obtained: '', total: '', passing: '' }]);
  };

  const analyzeManualData = async () => {
    const data = subjects
      .filter((entry) => entry.subject && !isNaN(parseFloat(entry.obtained)))
      .map((entry) => ({
        subject: entry.subject,
        obtained: parseFloat(entry.obtained),
        total: parseFloat(entry.total) || 100,
        passing: parseFloat(entry.passing) || (parseFloat(entry.total) * 0.4) || 40,
      }));

    if (!data.length) {
      alert('Please enter at least one subject with marks');
      return;
    }

    setStudentData(data);
    await analyzeData(data);
  };

  const calculatePerformanceMetrics = (subjects) => {
    const totalSubjects = subjects.length;
    let passedSubjects = 0;
    let highRiskSubjects = 0;
    let mediumRiskSubjects = 0;
    let lowRiskSubjects = 0;
    let totalPercentage = 0;

    subjects.forEach((subject) => {
      const percentage = (subject.obtained / subject.total) * 100;
      totalPercentage += percentage;

      if (subject.obtained >= subject.passing) {
        passedSubjects++;
      }

      if (percentage < 50) {
        highRiskSubjects++;
      } else if (percentage < 75) {
        mediumRiskSubjects++;
      } else {
        lowRiskSubjects++;
      }
    });

    const overallPercentage = totalPercentage / totalSubjects;
    let overallRisk = 'low';
    if (overallPercentage < 50) overallRisk = 'high';
    else if (overallPercentage < 75) overallRisk = 'medium';

    return {
      totalSubjects,
      passedSubjects,
      failedSubjects: totalSubjects - passedSubjects,
      highRiskSubjects,
      mediumRiskSubjects,
      lowRiskSubjects,
      overallPercentage: Math.round(overallPercentage * 10) / 10,
      overallRisk,
    };
  };

  const generateRecommendations = async (subjects, metrics) => {
    const performanceData = subjects.map((s) => ({
      subject: s.subject,
      percentage: Math.round((s.obtained / s.total) * 1000) / 10,
      status: s.obtained >= s.passing ? 'passed' : 'failed',
    }));

    const prompt = `You are an expert education counselor. Analyze this student performance data and provide specific recommendations:
    
    Performance Overview:
    - Overall Percentage: ${metrics.overallPercentage}%
    - Subjects Passed: ${metrics.passedSubjects}/${metrics.totalSubjects}
    - High Risk Subjects: ${metrics.highRiskSubjects}
    - Medium Risk Subjects: ${metrics.mediumRiskSubjects}
    
    Subject-wise Performance:
    ${performanceData.map((sub) => `- ${sub.subject}: ${sub.percentage}% (${sub.status})`).join('\n')}
    
    Provide:
    1. A brief overall assessment (2-3 sentences)
    2. Specific recommendations for each high-risk subject
    3. General study improvement strategies
    4. A motivational closing statement
    
    Format the response in HTML with headings and bullet points.`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error:', error);
      return `
        <h4>Performance Analysis</h4>
        <p>Based on your scores, here are some general recommendations:</p>
        <ul>
          ${metrics.highRiskSubjects > 0 ? `<li>Focus on high-risk subjects (below 50%)</li>` : ''}
          ${metrics.mediumRiskSubjects > 0 ? `<li>Practice regularly for medium-risk subjects (50-75%)</li>` : ''}
          <li>Create a study schedule allocating more time to weaker subjects</li>
          <li>Seek help from teachers or tutors for difficult concepts</li>
          <li>Practice with past papers and sample questions</li>
        </ul>
      `;
    }
  };

  const getPerformanceLabel = (percentage) => {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 75) return 'Very Good';
    if (percentage >= 60) return 'Good';
    if (percentage >= 50) return 'Average';
    if (percentage >= 33) return 'Below Average';
    return 'Poor';
  };

  const analyzeData = async (data) => {
    setIsLoading(true);
    try {
      const metrics = calculatePerformanceMetrics(data);
      const recText = await generateRecommendations(data, metrics);
      setRecommendations(recText);
      setView('results');
    } catch (error) {
      console.error('Analysis Error:', error);
      alert('Failed to analyze data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setStudentData([]);
    setFileName('No file selected');
    setSubjects([{ subject: '', obtained: '', total: '', passing: '' }]);
    setRecommendations('');
    setView('input');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {view === 'input' && (
        <section className="card">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Analyze Student Performance</h2>
          <p className="text-[var(--muted)] mb-6">Upload marksheet image or enter marks manually to predict performance risks</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-bold text-[var(--text)] mb-2">Upload Marksheet</h3>
              <p className="text-[var(--muted)] mb-4">Upload an image of your marksheet for automatic analysis</p>
              <div className="border-dashed border-2 border-[var(--border)] p-4 text-center rounded-lg">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="material-icons text-3xl text-[var(--primary)]">image</span>
                  <span className="block text-[var(--text)]">Choose Image</span>
                </label>
                <p className="text-[var(--muted)] mt-2">{fileName}</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-[var(--muted)]">OR</span>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-[var(--text)] mb-2">Enter Marks Manually</h3>
              <p className="text-[var(--muted)] mb-4">Enter your subject-wise marks for analysis</p>
              <button onClick={() => setView('manual')} className="btn-secondary">Enter Marks</button>
            </div>
          </div>
          {isLoading && (
            <div className="flex items-center space-x-2 mt-4">
              <div className="w-6 h-6 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[var(--muted)]">Analyzing your marksheet...</p>
            </div>
          )}
        </section>
      )}
      {view === 'manual' && (
        <section className="card">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Enter Subject Details</h2>
          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[var(--muted)] font-medium">Subject Name</label>
                  <input
                    type="text"
                    value={subject.subject}
                    onChange={(e) => handleManualInputChange(index, 'subject', e.target.value)}
                    placeholder="e.g., Mathematics"
                    className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] font-medium">Marks Obtained</label>
                  <input
                    type="number"
                    value={subject.obtained}
                    onChange={(e) => handleManualInputChange(index, 'obtained', e.target.value)}
                    placeholder="Your marks"
                    className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] font-medium">Total Marks</label>
                  <input
                    type="number"
                    value={subject.total}
                    onChange={(e) => handleManualInputChange(index, 'total', e.target.value)}
                    placeholder="Full marks"
                    className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] font-medium">Passing Marks</label>
                  <input
                    type="number"
                    value={subject.passing}
                    onChange={(e) => handleManualInputChange(index, 'passing', e.target.value)}
                    placeholder="Pass marks"
                    className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex space-x-4">
            <button onClick={addSubject} className="btn-secondary">+ Add Another Subject</button>
            <button onClick={analyzeManualData} className="btn-primary">Analyze Performance</button>
            <button
              onClick={() => setView('input')}
              className="text-[var(--primary)] hover:underline"
            >
              ← Back
            </button>
          </div>
        </section>
      )}
      {view === 'results' && (
        <section className="card">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Performance Analysis Report</h2>
          <div className="mb-6">
            <h3 className="font-bold text-[var(--text)] mb-2">Overall Performance</h3>
            <div id="summary-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Summary cards will be dynamically inserted */}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-bold text-[var(--text)] mb-2">Subject-wise Analysis</h3>
            <div id="performance-table" className="overflow-x-auto">
              <table className="w-full border-collapse border border-[var(--border)]">
                <thead>
                  <tr className="bg-[var(--background)]">
                    <th className="border border-[var(--border)] p-2 text-[var(--text)]">Subject</th>
                    <th className="border border-[var(--border)] p-2 text-[var(--text)]">Marks</th>
                    <th className="border border-[var(--border)] p-2 text-[var(--text)]">Percentage</th>
                    <th className="border border-[var(--border)] p-2 text-[var(--text)]">Status</th>
                    <th className="border border-[var(--border)] p-2 text-[var(--text)]">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.map((subject, index) => {
                    const percentage = (subject.obtained / subject.total) * 100;
                    const roundedPercentage = Math.round(percentage * 10) / 10;
                    const passed = subject.obtained >= subject.passing;
                    const riskLevel = percentage < 50 ? 'High Risk' : percentage < 75 ? 'Medium Risk' : 'Low Risk';
                    const riskClass = percentage < 50 ? 'text-[var(--error)]' : percentage < 75 ? 'text-[var(--warning)]' : 'text-[var(--success)]';

                    return (
                      <tr key={index}>
                        <td className="border border-[var(--border)] p-2 text-[var(--text)]">{subject.subject}</td>
                        <td className="border border-[var(--border)] p-2 text-[var(--text)]">{subject.obtained}/{subject.total}</td>
                        <td className="border border-[var(--border)] p-2 text-[var(--text)]">{roundedPercentage}%</td>
                        <td className="border border-[var(--border)] p-2 text-[var(--text)]">{passed ? 'Passed' : 'Failed'}</td>
                        <td className="border border-[var(--border)] p-2"><span className={riskClass}>{riskLevel}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-bold text-[var(--text)] mb-2">Performance Visualization</h3>
            <div className="card p-4">
              <canvas id="performance-chart" ref={chartRef}></canvas>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-bold text-[var(--text)] mb-2">Recommendations</h3>
            <div
              id="recommendations-list"
              className="text-[var(--text)]"
              dangerouslySetInnerHTML={{ __html: recommendations }}
            />
          </div>
          <button onClick={resetAnalysis} className="btn-primary">Perform New Analysis</button>
        </section>
      )}
    </div>
  );
}

export default RiskPredictor;