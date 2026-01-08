import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

function AdvancedCharts({ history }) {
  // Pie Chart Data
  const sentimentCounts = history.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'Positive', value: sentimentCounts.POSITIVE || 0, color: '#10b981' },
    { name: 'Neutral', value: sentimentCounts.NEUTRAL || 0, color: '#6b7280' },
    { name: 'Negative', value: sentimentCounts.NEGATIVE || 0, color: '#ef4444' }
  ];

  // Confidence Trend Data
  const trendData = history.slice(0, 20).reverse().map((item, idx) => ({
    index: idx + 1,
    confidence: (item.confidence * 100).toFixed(1),
    name: `#${idx + 1}`
  }));

  // Average confidence
  const avgConfidence = history.length > 0
    ? (history.reduce((sum, item) => sum + item.confidence, 0) / history.length * 100).toFixed(1)
    : 0;

  return (
    <>
      {/* Pie Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Sentiment Breakdown</h2>
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-300 flex items-center justify-center text-gray-400">
            Analyze data to see breakdown
          </div>
        )}
      </div>

      {/* Confidence Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp size={24} />
            Confidence Trend
          </h2>
          <span className="text-sm text-gray-600">
            Avg: <span className="font-bold text-indigo-600">{avgConfidence}%</span>
          </span>
        </div>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 5, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-250 flex items-center justify-center text-gray-400">
            Trend data will appear here
          </div>
        )}
      </div>
    </>
  );
}

export default AdvancedCharts;