import { useState } from 'react';
import UploadCard from './components/UploadCard';
import Dashboard from './components/Dashboard';
import { Sparkles } from 'lucide-react';

// Mock data for demonstration
const mockAnalysisData = {
  insights: [
    'Sales dropped by 20% in March compared to previous month',
    'Weekend traffic is 35% lower than weekdays',
    'Customer retention rate improved by 12% after feature launch',
    'Mobile users have 2x higher bounce rate than desktop',
  ],
  rootCause:
    'The decline in sales can be attributed to a combination of seasonal factors and reduced marketing spend. Analysis shows that competitor promotions during March coincided with our reduced ad budget. Additionally, the website performance issues on mobile devices likely contributed to the higher bounce rate, resulting in lost conversion opportunities.',
  decisions: [
    'Increase discounts and promotions during weekends to boost traffic',
    'Focus marketing budget on high-performing regions (North & West)',
    'Optimize mobile website performance to reduce bounce rate',
    'Launch targeted email campaign to re-engage dormant customers',
    'A/B test new landing page designs for better conversion',
  ],
  alerts: [
    { message: 'Warning: Declining revenue trend detected over 3 weeks', severity: 'critical' },
    { message: 'Alert: Mobile bounce rate exceeds industry benchmark by 45%', severity: 'warning' },
    { message: 'Notice: Inventory levels low for top 3 products', severity: 'warning' },
  ],
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalyze = async ({ file, role }) => {
    setIsLoading(true);

    // Simulate API call with timeout
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Customize mock data based on role
    const roleSpecificData = {
      ...mockAnalysisData,
      insights:
        role === 'student'
          ? ['Assignment completion rate dropped by 15%', 'Online study sessions have low attendance']
          : role === 'founder'
            ? ['Burn rate increased by 25% this quarter', 'Customer acquisition cost rose 40%']
            : mockAnalysisData.insights,
    };

    setAnalysisData(roleSpecificData);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 relative">
      {/* Animated background blobs */}
      <div className="gradient-blob gradient-blob-1" />
      <div className="gradient-blob gradient-blob-2" />
      <div className="gradient-blob gradient-blob-3" />

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-20 animate-fade-in-up">
          <div className="flex flex-col items-center gap-6">
            <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl shadow-indigo-500/25 animate-float">
              <Sparkles className="w-14 h-14 text-white" />
            </div>
            <h1 className="title-gradient shimmer-text text-5xl md:text-7xl font-extrabold tracking-tight">
              InsightX
            </h1>
          </div>
          <p className="text-gray-500 text-lg md:text-xl mt-5 max-w-xl mx-auto font-medium tracking-wide">
            AI-Powered Autonomous Data Decision Agent
          </p>
        </header>

        {/* Upload Section */}
        <div className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <UploadCard onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Dashboard Section */}
        {analysisData && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <Dashboard data={analysisData} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-24 pb-8">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <p>Built with React & Tailwind CSS</p>
            <Sparkles className="w-4 h-4" />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
