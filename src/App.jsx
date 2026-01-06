import React, { useState } from 'react';
import { MessageSquare, Upload, Download, Trash2, Settings, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);

  // Simple sentiment analysis
  const analyzeSentiment = (text) => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'awesome', 'happy', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'disappointed', 'sad', 'angry'];
    
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\W+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) return { sentiment: 'NEUTRAL', score: 0.5 };
    
    const positiveScore = positiveCount / total;
    const negativeScore = negativeCount / total;
    
    if (positiveScore > negativeScore) {
      return { sentiment: 'POSITIVE', score: 0.6 + (positiveScore * 0.35) };
    } else if (negativeScore > positiveScore) {
      return { sentiment: 'NEGATIVE', score: 0.6 + (negativeScore * 0.35) };
    }
    return { sentiment: 'NEUTRAL', score: 0.5 };
  };

  const handleAnalyze = () => {
    if (!text.trim()) return;
    
    setAnalyzing(true);
    setTimeout(() => {
      const result = analyzeSentiment(text);
      const entry = {
        id: Date.now(),
        text: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        fullText: text,
        sentiment: result.sentiment,
        confidence: result.score,
        timestamp: new Date().toLocaleString(),
        source: 'manual'
      };
      
      setCurrentResult(entry);
      setHistory([entry, ...history]);
      setText('');
      setAnalyzing(false);
    }, 500);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const textColumnIndex = headers.findIndex(h => 
        ['text', 'review', 'comment', 'feedback'].includes(h)
      );
      
      if (textColumnIndex === -1) {
        alert('Could not find text column. Make sure your CSV has a column named: text, review, or comment');
        return;
      }
      
      const newEntries = [];
      for (let i = 1; i < Math.min(lines.length, 51); i++) {
        const row = lines[i].split(',');
        const textToAnalyze = row[textColumnIndex]?.replace(/^"|"$/g, '').trim();
        
        if (textToAnalyze && textToAnalyze.length > 5) {
          const result = analyzeSentiment(textToAnalyze);
          newEntries.push({
            id: Date.now() + i,
            text: textToAnalyze.substring(0, 150) + (textToAnalyze.length > 150 ? '...' : ''),
            fullText: textToAnalyze,
            sentiment: result.sentiment,
            confidence: result.score,
            timestamp: new Date().toLocaleString(),
            source: 'csv'
          });
        }
      }
      
      setHistory([...newEntries, ...history]);
      alert(`✅ Analyzed ${newEntries.length} entries!`);
    };
    
    reader.readAsText(file);
    event.target.value = null;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Text', 'Sentiment', 'Confidence', 'Timestamp', 'Source'],
      ...history.map(item => [
        `"${item.fullText.replace(/"/g, '""')}"`,
        item.sentiment,
        item.confidence.toFixed(3),
        item.timestamp,
        item.source
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment-analysis-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'POSITIVE': return 'text-green-600 bg-green-50 border-green-200';
      case 'NEGATIVE': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const sentimentCounts = history.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Positive', count: sentimentCounts.POSITIVE || 0, fill: '#10b981' },
    { name: 'Neutral', count: sentimentCounts.NEUTRAL || 0, fill: '#6b7280' },
    { name: 'Negative', count: sentimentCounts.NEGATIVE || 0, fill: '#ef4444' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <MessageSquare className="text-indigo-600" size={40} />
            Sentiment Analysis Dashboard
          </h1>
          <p className="text-gray-600 mt-2">AI-powered emotion detection from text data</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600">Positive</div>
            <div className="text-3xl font-bold text-green-600">{sentimentCounts.POSITIVE || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
            <div className="text-sm text-gray-600">Neutral</div>
            <div className="text-3xl font-bold text-gray-600">{sentimentCounts.NEUTRAL || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="text-sm text-gray-600">Negative</div>
            <div className="text-3xl font-bold text-red-600">{sentimentCounts.NEGATIVE || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analyze Text</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to analyze (reviews, feedback, comments)..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !text.trim()}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {analyzing ? 'Analyzing...' : 'Analyze'}
              </button>
              
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold flex items-center gap-2">
                  <Upload size={20} />
                  CSV
                </div>
              </label>
            </div>

            {currentResult && (
              <div className={`mt-6 p-4 rounded-lg border-2 ${getSentimentColor(currentResult.sentiment)}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-4 py-2 rounded-full font-bold ${getSentimentColor(currentResult.sentiment)}`}>
                    {currentResult.sentiment}
                  </span>
                  <span className="text-sm font-semibold">
                    {(currentResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 italic">"{currentResult.text}"</p>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Distribution</h2>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-250 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Database size={48} className="mx-auto mb-2" />
                  <p>No data yet - start analyzing!</p>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Analysis History</h2>
              {history.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium"
                  >
                    <Download size={16} />
                    Export
                  </button>
                  <button
                    onClick={() => setHistory([])}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No analysis yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className={`p-3 rounded-lg border ${getSentimentColor(item.sentiment)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment} ({(item.confidence * 100).toFixed(0)}%)
                      </span>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;