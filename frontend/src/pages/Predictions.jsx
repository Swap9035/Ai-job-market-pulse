// Predictions.jsx — ML Predictions Dashboard
// Shows scikit-learn model predictions for skill demand
// This is the most technically impressive page

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import useApi from '../hooks/useApi';

const TREND_STYLES = {
  rising: {
    badge: 'bg-green-100 text-green-700',
    icon: '↑',
    label: 'Rising'
  },
  stable: {
    badge: 'bg-blue-100 text-blue-700',
    icon: '→',
    label: 'Stable'
  },
  falling: {
    badge: 'bg-red-100 text-red-700',
    icon: '↓',
    label: 'Falling'
  }
};

const PRIORITY_STYLES = {
  HIGH: 'bg-green-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW: 'bg-gray-400 text-white'
};

function SkillPredictionCard({ prediction }) {
  const [showChart, setShowChart] = useState(false);
  const trend = TREND_STYLES[prediction.trend] || TREND_STYLES.stable;

  // Build chart data combining historical + predicted
  const chartData = [];

  if (prediction.historical) {
    Object.entries(prediction.historical).forEach(([year, count]) => {
      chartData.push({
        year: parseInt(year),
        actual: count,
        predicted: null
      });
    });
  }

  // Add predictions
  if (prediction.predicted_2024) {
    chartData.push({
      year: 2024,
      actual: null,
      predicted: Math.round(prediction.predicted_2024)
    });
  }
  if (prediction.predicted_2025) {
    chartData.push({
      year: 2025,
      actual: null,
      predicted: Math.round(prediction.predicted_2025)
    });
  }

  chartData.sort((a, b) => a.year - b.year);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {prediction.skill}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${trend.badge}`}>
              {trend.icon} {trend.label}
            </span>
            <span className="text-xs text-gray-400">
              R² = {prediction.r2_score}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${
            prediction.growth_rate > 0 ? 'text-green-600' : 'text-red-500'
          }`}>
            {prediction.growth_rate > 0 ? '+' : ''}{prediction.growth_rate}%
          </p>
          <p className="text-xs text-gray-400">growth rate</p>
        </div>
      </div>

      {/* Prediction numbers */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-blue-50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-blue-600">
            {Math.round(prediction.predicted_2024)}
          </p>
          <p className="text-xs text-blue-500">Predicted 2024</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-purple-600">
            {Math.round(prediction.predicted_2025)}
          </p>
          <p className="text-xs text-purple-500">Predicted 2025</p>
        </div>
      </div>

      {/* Toggle chart */}
      <button
        onClick={() => setShowChart(!showChart)}
        className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 border-t border-gray-100 mt-1"
      >
        {showChart ? '▲ Hide chart' : '▼ Show trend chart'}
      </button>

      {/* Mini trend chart */}
      {showChart && (
        <div className="mt-3">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: '11px' }} />
              <ReferenceLine
                x={2023}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{ value: 'Now', fontSize: 9 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Historical"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Predicted"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}


function Predictions() {
  const { data: predictions, loading: loadingPred } = useApi('/api/predictions/skills');
  const { data: bestToLearn, loading: loadingBest } = useApi('/api/predictions/best-to-learn');
  const [activeTab, setActiveTab] = useState('predictions');

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          🤖 ML Skill Predictions
        </h1>
        <p className="text-gray-500 mt-1">
          scikit-learn LinearRegression models trained on 2020-2023 job data
        </p>
      </div>

      {/* How it works banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          How the ML model works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>Count skill frequency per year (2020-2023)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>Train LinearRegression: X=year, y=job count</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>Model finds best-fit line through data points</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span>Extrapolate line to predict 2024 and 2025</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'predictions', label: '📈 Skill Predictions' },
          { id: 'learn', label: '🎯 What to Learn' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Skill Predictions */}
      {activeTab === 'predictions' && (
        <div>
          {loadingPred ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-5 h-48"></div>
              ))}
            </div>
          ) : predictions && predictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((pred, index) => (
                <SkillPredictionCard key={index} prediction={pred} />
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-yellow-700 font-medium mb-2">
                ⚠️ No predictions found
              </p>
              <p className="text-yellow-600 text-sm">
                Run the ML training notebook first:
              </p>
              <code className="text-xs bg-yellow-100 px-2 py-1 rounded mt-2 inline-block">
                notebooks/02_ml_predictions.ipynb
              </code>
            </div>
          )}
        </div>
      )}

      {/* Tab: What to Learn */}
      {activeTab === 'learn' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Skills ranked by predicted demand in 2025 — focus on HIGH priority first
          </p>
          {loadingBest ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-xl border h-16"></div>
              ))}
            </div>
          ) : bestToLearn && bestToLearn.length > 0 ? (
            <div className="space-y-3">
              {bestToLearn.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                >
                  <span className="text-gray-400 font-mono text-sm w-6">
                    {index + 1}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded w-16 text-center ${
                    PRIORITY_STYLES[item.priority]
                  }`}>
                    {item.priority}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.skill}</p>
                    <p className="text-xs text-gray-400">
                      Predicted 2025 demand: {Math.round(item.predicted_demand)} jobs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      item.growth_rate > 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {item.growth_rate > 0 ? '+' : ''}{item.growth_rate}%
                    </p>
                    <p className="text-xs text-gray-400">growth</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              Run the training notebook to see recommendations
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default Predictions;