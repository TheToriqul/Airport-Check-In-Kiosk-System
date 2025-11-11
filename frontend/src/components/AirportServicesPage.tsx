import { ArrowLeft, ShoppingBag, Utensils, Wifi, Car, Hotel, Heart, Baby } from 'lucide-react';
import { useKioskStore } from '../store/kioskStore';
import logo from '../assets/image/logo.png';

export default function AirportServicesPage() {
  const { reset, setActivePage } = useKioskStore();

  const services = [
    {
      icon: ShoppingBag,
      title: 'Shopping & Duty-Free',
      description: 'Browse our wide selection of duty-free items, souvenirs, and travel essentials.',
      locations: ['Terminal 1: Gates A1-A20', 'Terminal 2: Gates B1-B15', 'Terminal 3: Main Concourse'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Utensils,
      title: 'Dining & Restaurants',
      description: 'Enjoy a variety of dining options from quick snacks to fine dining.',
      locations: ['Food Court: Terminal 1 & 2', 'Restaurants: Terminal 3', 'Coffee Shops: All Terminals'],
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Wifi,
      title: 'Free Wi-Fi',
      description: 'Complimentary high-speed Wi-Fi available throughout the airport.',
      locations: ['Network: Airport-Free-WiFi', 'No password required', 'Available in all terminals'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Car,
      title: 'Transportation',
      description: 'Car rental, taxi services, and airport shuttles available.',
      locations: ['Ground Transportation: Level 1', 'Car Rental: Terminal 1', 'Taxi Stand: All Terminals'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Hotel,
      title: 'Airport Hotel',
      description: 'Comfortable accommodations for layovers and early departures.',
      locations: ['Airport Hotel: Terminal 2, Level 3', '24-hour service', 'Reservations: +1 (800) 123-4567'],
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Heart,
      title: 'Medical Services',
      description: 'First aid stations and medical assistance available 24/7.',
      locations: ['Medical Center: Terminal 1, Level 2', 'First Aid: All Terminals', 'Emergency: Dial 911'],
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Baby,
      title: 'Family Services',
      description: 'Nursing rooms, play areas, and family-friendly facilities.',
      locations: ['Family Restrooms: All Terminals', 'Nursing Rooms: Near Gates', 'Play Areas: Terminal 2 & 3'],
      color: 'from-pink-500 to-pink-600'
    }
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
                <h1 className="text-3xl font-extrabold gradient-text">Airport Services</h1>
                <p className="text-gray-600">Discover available services and amenities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="card hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-700 mb-4">{service.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase">Locations:</p>
                  <ul className="space-y-1">
                    {service.locations.map((location, locIndex) => (
                      <li key={locIndex} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>{location}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Need More Information?</h3>
          <p className="text-gray-700 mb-4">
            For additional services or assistance, please visit the information desk located in each terminal 
            or contact airport customer service at +1 (800) 123-4567.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setActivePage(null);
                reset();
              }}
              className="btn-secondary"
            >
              Back to Home
            </button>
            <button
              onClick={() => {
                setActivePage(null);
                reset();
              }}
              className="btn-primary"
            >
              Start Check-In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

