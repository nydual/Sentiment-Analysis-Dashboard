export const analyzeWithHuggingFace = async (text, apiKey) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle model loading
    if (result.error && result.error.includes('loading')) {
      throw new Error('Model is loading, please try again in a moment');
    }
    
    const scores = result[0];
    const positive = scores.find(s => s.label === 'POSITIVE')?.score || 0;
    const negative = scores.find(s => s.label === 'NEGATIVE')?.score || 0;
    
    return {
      sentiment: positive > negative ? 'POSITIVE' : 'NEGATIVE',
      score: Math.max(positive, negative),
      provider: 'huggingface'
    };
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    throw error;
  }
};

export const analyzeWithHuggingFaceFinancial = async (text, apiKey) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/ProsusAI/finbert",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const result = await response.json();
    const scores = result[0];
    
    const positive = scores.find(s => s.label === 'positive')?.score || 0;
    const negative = scores.find(s => s.label === 'negative')?.score || 0;
    const neutral = scores.find(s => s.label === 'neutral')?.score || 0;
    
    let sentiment = 'NEUTRAL';
    if (positive > negative && positive > neutral) sentiment = 'POSITIVE';
    else if (negative > positive && negative > neutral) sentiment = 'NEGATIVE';
    
    return {
      sentiment,
      score: Math.max(positive, negative, neutral),
      provider: 'finbert'
    };
  } catch (error) {
    console.error('FinBERT API Error:', error);
    throw error;
  }
};