import { ArrowLeft, Map, Navigation, Building2, Plane } from 'lucide-react';
import { useKioskStore } from '../store/kioskStore';
import logo from '../assets/image/logo.png';

export default function TerminalMapPage() {
  const { reset, setActivePage } = useKioskStore();

  const terminals = [
    {
      id: 'terminal1',
      name: 'Terminal 1',
      gates: ['A1-A20', 'A21-A40'],
      services: ['Check-In Counters 1-30', 'Security Checkpoint A', 'Food Court', 'Duty-Free Shop'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'terminal2',
      name: 'Terminal 2',
      gates: ['B1-B25', 'B26-B50'],
      services: ['Check-In Counters 31-60', 'Security Checkpoint B', 'Restaurants', 'Business Lounge'],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'terminal3',
      name: 'Terminal 3',
      gates: ['C1-C30', 'C31-C60'],
      services: ['Check-In Counters 61-90', 'Security Checkpoint C', 'Shopping Mall', 'VIP Lounge'],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const facilities = [
    { name: 'Check-In Counters', icon: Building2, description: 'Located on Level 2 of all terminals' },
    { name: 'Security Checkpoints', icon: Navigation, description: 'Before entering departure gates' },
    { name: 'Gates', icon: Plane, description: 'Departure gates are clearly marked' },
    { name: 'Baggage Claim', icon: Building2, description: 'Level 1, follow signs after arrival' }
  ];

  return (
    <div className="min-h-full p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setActivePage(null)}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Airport Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-3xl font-extrabold gradient-text">Terminal Map</h1>
                <p className="text-gray-600">Navigate the airport terminals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terminals */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {terminals.map((terminal) => (
            <div
              key={terminal.id}
              className="card hover:shadow-2xl transition-all duration-300"
            >
              <div className={`w-full h-32 bg-gradient-to-br ${terminal.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <h2 className="text-3xl font-bold text-white">{terminal.name}</h2>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-primary-600" />
                  Gates
                </h3>
                <div className="flex flex-wrap gap-2">
                  {terminal.gates.map((gate, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold"
                    >
                      {gate}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Services</h3>
                <ul className="space-y-1">
                  {terminal.services.map((service, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Key Facilities */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Map className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Key Facilities</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {facilities.map((facility, index) => {
              const Icon = facility.icon;
              return (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{facility.name}</h3>
                  </div>
                  <p className="text-sm text-gray-700">{facility.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tips */}
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Navigation Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Follow the overhead signs for directions to your gate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Gate numbers are displayed on airport screens and your boarding pass</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Allow at least 15 minutes to walk between terminals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Information desks are located in each terminal for assistance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

