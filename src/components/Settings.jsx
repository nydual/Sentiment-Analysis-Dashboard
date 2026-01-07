import React from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';

function Settings({ show, onClose, apiKey, setApiKey, useApi, setUseApi, industry, setIndustry }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <SettingsIcon size={24} />
              Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Industry Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Industry Focus
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIndustry('finance')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    industry === 'finance'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  💰 Financial Services
                </button>
                <button
                  onClick={() => setIndustry('government')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    industry === 'government'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏛️ Government/Public
                </button>
              </div>
            </div>

            {/* API Configuration */}
            <div className="border-t pt-6">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={useApi}
                  onChange={(e) => setUseApi(e.target.checked)}
                  className="w-5 h-5 text-indigo-600"
                />
                <span className="font-semibold text-gray-700">
                  Use Hugging Face API (Higher Accuracy)
                </span>
              </label>

              {useApi && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Hugging Face API Key
                    <a
                      href="https://huggingface.co/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 ml-2 text-xs hover:underline"
                    >
                      Get Free API Key →
                    </a>
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="hf_..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>How to get your API key:</strong>
                    </p>
                    <ol className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-decimal">
                      <li>Go to huggingface.co and sign up (free)</li>
                      <li>Go to Settings → Access Tokens</li>
                      <li>Create new token with "Read" access</li>
                      <li>Copy and paste it here</li>
                    </ol>
                  </div>
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-800">
                      ✅ Your API key is stored only in your browser and sent only to Hugging Face.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Model Selection */}
            {useApi && apiKey && (
              <div className="border-t pt-6">
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Model Selection
                </label>
                <div className="space-y-2 text-sm text-gray-600">
                  {industry === 'finance' ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-semibold text-green-800">Using: FinBERT</p>
                      <p className="text-xs mt-1">Specialized for financial text analysis</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-semibold text-blue-800">Using: DistilBERT</p>
                      <p className="text-xs mt-1">General purpose sentiment analysis</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;