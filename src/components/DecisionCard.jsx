import { Target } from 'lucide-react';

export default function DecisionCard({ decisions }) {
  return (
    <div className="glass-card rounded-2xl shadow-lg p-7 transform transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:shadow-green-500/10 border border-gray-100/60 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md shadow-green-500/20">
          <Target className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Recommended Actions</h3>
      </div>

      <ul className="space-y-4">
        {decisions.map((decision, index) => (
          <li key={index} className="flex items-start gap-3 group transition-all duration-300 hover:translate-x-1">
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full transition-transform group-hover:scale-150" />
            <span className="text-gray-600 leading-relaxed text-sm">{decision}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
