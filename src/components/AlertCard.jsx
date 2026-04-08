import { AlertTriangle } from 'lucide-react';

export default function AlertCard({ alerts }) {
  const getAlertStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50/80 border-red-400 text-red-800';
      case 'warning':
        return 'bg-amber-50/80 border-amber-400 text-amber-800';
      default:
        return 'bg-orange-50/80 border-orange-400 text-orange-800';
    }
  };

  const getBadgeStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm shadow-red-500/25';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm shadow-amber-500/25';
      default:
        return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25';
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-lg p-7 transform transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:shadow-red-500/10 border border-gray-100/60 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-md shadow-red-500/20 animate-pulse-glow">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Alerts</h3>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border-l-4 ${getAlertStyles(alert.severity)} transition-all duration-300 hover:scale-[1.02] hover:shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${getBadgeStyles(alert.severity)}`}>
                {alert.severity}
              </span>
              <p className="font-medium text-sm flex-1 leading-relaxed">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
