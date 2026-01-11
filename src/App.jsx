import React, { useState } from 'react';
import { MessageSquare, Upload, Download, Trash2, Database, Settings as SettingsIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { financialSamples, governmentSamples, createSampleCSV } from './data/sampleData';
import { analyzeWithHuggingFace, analyzeWithHuggingFaceFinancial } from './utils/huggingFaceAPI';
import Settings from './components/Settings';

function App() {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [industry, setIndustry] = useState('finance');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [useApi, setUseApi] = useState(false);

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

  const loadSampleData = () => {
    const samples = industry === 'finance' ? financialSamples : governmentSamples;
    
    const newEntries = samples.map((item, index) => {
      const result = analyzeSentiment(item.text);
      return {
        id: Date.now() + index,
        text: item.text.substring(0, 150) + (item.text.length > 150 ? '...' : ''),
        fullText: item.text,
        sentiment: result.sentiment,
        confidence: result.score,
        timestamp: new Date().toLocaleString(),
        source: 'sample',
        category: item.category
      };
    });
    
    setHistory([...newEntries, ...history]);
    alert(`✅ Loaded ${newEntries.length} sample ${industry} reviews!`);
  };

  const downloadSampleCSV = () => {
    const csvContent = createSampleCSV(industry);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${industry}-sample-data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setAnalyzing(true);
    try {
      let result;
      
      if (useApi && apiKey) {
        if (industry === 'finance') {
          result = await analyzeWithHuggingFaceFinancial(text, apiKey);
        } else {
          result = await analyzeWithHuggingFace(text, apiKey);
        }
      } else {
        result = analyzeSentiment(text);
      }
      
      const entry = {
        id: Date.now(),
        text: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        fullText: text,
        sentiment: result.sentiment,
        confidence: result.score,
        timestamp: new Date().toLocaleString(),
        source: useApi ? 'api' : 'local',
        provider: result.provider || 'local'
      };
      
      setCurrentResult(entry);
      setHistory([entry, ...history]);
      setText('');
    } catch (error) {
      alert(`❌ Error: ${error.message}\n\nFalling back to local analysis...`);
      const result = analyzeSentiment(text);
      const entry = {
        id: Date.now(),
        text: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        fullText: text,
        sentiment: result.sentiment,
        confidence: result.score,
        timestamp: new Date().toLocaleString(),
        source: 'local'
      };
      setCurrentResult(entry);
      setHistory([entry, ...history]);
      setText('');
    }
    setAnalyzing(false);
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
      ['Text', 'Sentiment', 'Confidence', 'Timestamp', 'Source', 'Provider'],
      ...history.map(item => [
        `"${item.fullText.replace(/"/g, '""')}"`,
        item.sentiment,
        item.confidence.toFixed(3),
        item.timestamp,
        item.source,
        item.provider || 'local'
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
      case 'POSITIVE': return 'border-yellow-400/40 bg-yellow-400/10';
      case 'NEGATIVE': return 'border-purple-400/40 bg-purple-400/10';
      default: return 'border-cyan-400/40 bg-cyan-400/10';
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch(sentiment) {
      case 'POSITIVE': return 'bg-yellow-400/20 text-yellow-400 border border-yellow-400';
      case 'NEGATIVE': return 'bg-purple-400/20 text-purple-400 border border-purple-400';
      default: return 'bg-cyan-400/20 text-cyan-400 border border-cyan-400';
    }
  };

  const sentimentCounts = history.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Positive', count: sentimentCounts.POSITIVE || 0, fill: '#169a2cff' },
    { name: 'Neutral', count: sentimentCounts.NEUTRAL || 0, fill: '#d07ee5ff' },
    { name: 'Negative', count: sentimentCounts.NEGATIVE || 0, fill: '#de1912ff' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1f35] to-[#0f1419] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="text-cyan-400" size={40} />
              Sentiment Analysis Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              AI-powered emotion detection from text data
              {useApi && <span className="ml-2 text-yellow-400 font-semibold">• API Enabled</span>}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-[#1a2332] p-3 rounded-lg shadow-lg hover:bg-[#243447] transition-all border border-cyan-500/30"
          >
            <SettingsIcon size={24} className="text-cyan-400" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#1a2f4d] to-[#162840] rounded-lg shadow-xl p-6 mb-6 text-white border border-cyan-500/30">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">🚀 Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={loadSampleData}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-all shadow-lg"
            >
              📊 Load {industry === 'finance' ? 'Financial' : 'Government'} Sample Data
            </button>
            <button
              onClick={downloadSampleCSV}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg"
            >
              📥 Download Sample CSV
            </button>
            <button
              onClick={() => setIndustry(industry === 'finance' ? 'government' : 'finance')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-400 hover:to-purple-500 transition-all shadow-lg"
            >
              🔄 Switch to {industry === 'finance' ? 'Government' : 'Finance'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a2332] rounded-lg shadow-xl p-6 border-l-4 border-yellow-400">
            <div className="text-sm text-gray-400">Positive</div>
            <div className="text-3xl font-bold text-yellow-400">{sentimentCounts.POSITIVE || 0}</div>
          </div>
          <div className="bg-[#1a2332] rounded-lg shadow-xl p-6 border-l-4 border-cyan-400">
            <div className="text-sm text-gray-400">Neutral</div>
            <div className="text-3xl font-bold text-cyan-400">{sentimentCounts.NEUTRAL || 0}</div>
          </div>
          <div className="bg-[#1a2332] rounded-lg shadow-xl p-6 border-l-4 border-purple-400">
            <div className="text-sm text-gray-400">Negative</div>
            <div className="text-3xl font-bold text-purple-400">{sentimentCounts.NEGATIVE || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-[#1a2332] rounded-lg shadow-xl p-6 border border-cyan-500/30">
            <h2 className="text-xl font-semibold mb-4 text-white">Analyze Text</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to analyze (reviews, feedback, comments)..."
              className="w-full h-32 p-4 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 resize-none bg-[#0f1419] text-white placeholder-gray-500"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !text.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 text-gray-900 py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg"
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
                <div className="bg-[#243447] hover:bg-[#2d4159] text-cyan-400 py-3 px-4 rounded-lg font-semibold flex items-center gap-2 transition-colors border border-cyan-500/30">
                  <Upload size={20} />
                  CSV
                </div>
              </label>
            </div>

            {currentResult && (
              <div className={`mt-6 p-4 rounded-lg border-2 bg-[#0f1419] ${getSentimentColor(currentResult.sentiment)}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-4 py-2 rounded-full font-bold ${getSentimentBadge(currentResult.sentiment)}`}>
                    {currentResult.sentiment}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-300">
                      {(currentResult.confidence * 100).toFixed(1)}%
                    </div>
                    {currentResult.provider && (
                      <div className="text-xs text-gray-500">
                        via {currentResult.provider}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300 italic">"{currentResult.text}"</p>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-[#1a2332] rounded-lg shadow-xl p-6 border border-cyan-500/30">
            <h2 className="text-xl font-semibold mb-4 text-white">Distribution</h2>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2332', 
                      border: '1px solid #22d3ee40', 
                      color: '#fff',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-250 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Database size={48} className="mx-auto mb-2 text-cyan-400" />
                  <p className="text-cyan-400">No data yet - start analyzing!</p>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="lg:col-span-2 bg-[#1a2332] rounded-lg shadow-xl p-6 border border-cyan-500/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Analysis History</h2>
              {history.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm font-medium"
                  >
                    <Download size={16} />
                    Export
                  </button>
                  <button
                    onClick={() => setHistory([])}
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <MessageSquare size={48} className="mx-auto mb-3 opacity-50 text-cyan-400" />
                  <p className="text-cyan-400">No analysis yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className={`p-3 rounded-lg border bg-[#0f1419] ${getSentimentColor(item.sentiment)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSentimentBadge(item.sentiment)}`}>
                          {item.sentiment} ({(item.confidence * 100).toFixed(0)}%)
                        </span>
                        {item.provider && item.provider !== 'local' && (
                          <span className="px-2 py-1 bg-cyan-900/40 text-cyan-300 text-xs rounded-full border border-cyan-500/30">
                            {item.provider}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-300">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <Settings
          show={showSettings}
          onClose={() => setShowSettings(false)}
          apiKey={apiKey}
          setApiKey={setApiKey}
          useApi={useApi}
          setUseApi={setUseApi}
          industry={industry}
          setIndustry={setIndustry}
        />
      </div>
    </div>
  );
}

export default App;