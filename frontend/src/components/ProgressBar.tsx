import { Check, Circle } from 'lucide-react';
import { useKioskStore } from '../store/kioskStore';

type Step = {
  id: string;
  label: string;
  shortLabel: string;
};

const steps: Step[] = [
  { id: 'search', label: 'Search Booking', shortLabel: 'Search' },
  { id: 'seat-selection', label: 'Select Seat', shortLabel: 'Seat' },
  { id: 'baggage', label: 'Baggage Check-In', shortLabel: 'Baggage' },
  { id: 'boarding-pass', label: 'Boarding Pass', shortLabel: 'Pass' },
];

export default function ProgressBar() {
  const { currentStep, activePage } = useKioskStore();
  
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  // Don't show progress bar on search page or when menu page is active
  if (currentStep === 'search' || activePage) {
    return null;
  }

  return (
    <div className="w-full py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Desktop Progress Bar */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>

            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isUpcoming = index > currentStepIndex;

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg scale-110'
                        : isCurrent
                        ? 'bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-xl scale-125 ring-4 ring-primary-200 animate-pulse-slow'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isCurrent
                          ? 'text-primary-700'
                          : isCompleted
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-xs font-semibold text-primary-600">
              {steps[currentStepIndex]?.label}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-xs font-medium transition-colors ${
                  index <= currentStepIndex ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                {step.shortLabel}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

