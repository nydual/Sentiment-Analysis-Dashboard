export const financialSamples = [
  { text: "Company reports Q3 earnings beat expectations with 15% revenue growth", category: "earnings" },
  { text: "Stock plunges 20% after disappointing quarterly results and weak guidance", category: "stock_market" },
  { text: "Federal Reserve maintains interest rates, signaling cautious optimism", category: "policy" },
  { text: "Banking sector shows strong resilience with improved capital ratios", category: "banking" },
  { text: "Market volatility rises amid concerns over inflation and economic slowdown", category: "market_trend" },
  { text: "Tech stocks rally on strong earnings reports and AI optimism", category: "tech" },
  { text: "Credit default risk increases for commercial real estate sector", category: "risk" },
  { text: "Treasury yields remain stable as investors await policy decisions", category: "bonds" },
  { text: "Investment firm launches new sustainable finance initiative", category: "esg" },
  { text: "Bank faces regulatory scrutiny over lending practices", category: "regulation" }
];

export const governmentSamples = [
  { text: "The new online portal is easy to use and saved me a lot of time!", category: "digital_services" },
  { text: "Waited 3 hours at the DMV only to be told to come back another day", category: "dmv" },
  { text: "The service was adequate, staff followed standard procedures", category: "service_quality" },
  { text: "Excellent customer service! Agent was knowledgeable and solved my issue quickly", category: "service_quality" },
  { text: "Website is confusing and doesn't provide clear information about requirements", category: "digital_services" },
  { text: "Applied for permit online - simple process, received approval in 2 days", category: "permits" },
  { text: "Phone system kept disconnecting and couldn't reach a human representative", category: "customer_support" },
  { text: "Standard processing time, received response within expected timeframe", category: "processing" },
  { text: "Staff was professional and courteous, made the experience pleasant", category: "service_quality" },
  { text: "The new mobile app makes accessing services so much more convenient", category: "digital_services" }
];

export const createSampleCSV = (industry) => {
  const samples = industry === 'finance' ? financialSamples : governmentSamples;
  const csvContent = [
    'text,category',
    ...samples.map(item => `"${item.text}",${item.category}`)
  ].join('\n');
  
  return csvContent;
};