import { AlertCircle, X } from 'lucide-react';
import { useKioskStore } from '../store/kioskStore';

export default function ErrorDisplay() {
  const { error, setError } = useKioskStore();

  if (!error) return null;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-md animate-slide-in-right">
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300/80 rounded-2xl shadow-2xl p-5 flex items-start gap-4 backdrop-blur-sm relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-transparent opacity-50 animate-pulse-slow"></div>
        
        <div className="relative z-10 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1 relative z-10">
          <h3 className="font-bold text-red-900 mb-1.5 text-lg">Error</h3>
          <p className="text-sm text-red-800 leading-relaxed font-medium">{error}</p>
        </div>
        
        <button
          onClick={() => setError(null)}
          className="text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-110 active:scale-95 relative z-10 p-1 rounded-lg hover:bg-red-100"
          aria-label="Close error"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

