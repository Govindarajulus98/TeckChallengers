import InsightCard from './InsightCard';
import RootCauseCard from './RootCauseCard';
import DecisionCard from './DecisionCard';
import AlertCard from './AlertCard';

export default function Dashboard({ data }) {
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 leading-normal">
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Analysis Results
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-9">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          <InsightCard insights={data.insights} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <RootCauseCard rootCause={data.rootCause} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
          <DecisionCard decisions={data.decisions} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.35s', animationFillMode: 'both' }}>
          <AlertCard alerts={data.alerts} />
        </div>
      </div>
    </div>
  );
}
