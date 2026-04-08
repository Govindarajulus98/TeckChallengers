import { Search } from 'lucide-react';

export default function RootCauseCard({ rootCause }) {
  return (
    <div className="glass-card rounded-2xl shadow-lg p-7 transform transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:shadow-purple-500/10 border border-gray-100/60 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md shadow-purple-500/20">
          <Search className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Why (Root Cause)</h3>
      </div>

      <div className="bg-gradient-to-br from-purple-50/60 to-pink-50/40 rounded-xl p-5 border border-purple-100/60 transition-all duration-300 hover:shadow-sm">
        <p className="text-gray-600 leading-relaxed text-sm">
          {rootCause}
        </p>
      </div>
    </div>
  );
}
