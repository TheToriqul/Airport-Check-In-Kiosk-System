import { useState, useEffect } from 'react';
import { ArrowLeft, Luggage, Scale, Package, CheckCircle } from 'lucide-react';
import { baggageApi } from '../services/api';
import { wsService } from '../services/websocket';
import { useKioskStore } from '../store/kioskStore';
import logo from '../assets/image/logo.png';

export default function BaggageCheckIn() {
  const { booking, flight, setBaggage, setBaggageCount, baggageCount, setCurrentStep, setLoading, setError, isLoading } = useKioskStore();
  const [weight, setWeight] = useState('');
  const [count, setCount] = useState('1');

  useEffect(() => {
    if (!flight) return;

    // Load current baggage count
    const loadBaggageCount = async () => {
      try {
        const response = await baggageApi.getCount(flight.flightId);
        setBaggageCount(response.count);
      } catch (error) {
        console.error('Failed to load baggage count:', error);
      }
    };

    loadBaggageCount();

    // Subscribe to baggage updates via WebSocket
    wsService.connect();
    wsService.subscribeToBaggageUpdates(flight.flightId, (event) => {
      setBaggageCount(event.count);
    });
  }, [flight?.flightId, setBaggageCount]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !flight) return;

    const weightNum = parseFloat(weight);
    const countNum = parseInt(count);

    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    if (isNaN(countNum) || countNum <= 0) {
      setError('Please enter a valid baggage count');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await baggageApi.checkIn(booking.bookingId, {
        weight: weightNum,
        count: countNum,
      });
      setBaggage(response.baggage);
      setCurrentStep('boarding-pass');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to check in baggage';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setCurrentStep('boarding-pass');
  };

  return (
    <div className="min-h-full p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentStep('seat-selection')}
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
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900">Baggage Check-In</h1>
                <p className="text-gray-600">
                  {flight?.flightNumber} • {flight?.departureAirport} → {flight?.arrivalAirport}
                </p>
              </div>
            </div>
          </div>

          {booking && (
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg border border-primary-200">
              <p className="text-sm text-gray-700">
                <strong>Passenger:</strong> {booking.passengerName}
              </p>
            </div>
          )}
        </div>

        {/* Flight Baggage Info */}
        {flight && (
          <div className="card mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Luggage className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Baggage Checked</p>
                  <p className="text-3xl font-bold text-gray-900">{baggageCount}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Flight Capacity</p>
                <p className="text-lg font-semibold text-gray-700">Unlimited</p>
              </div>
            </div>
          </div>
        )}

        {/* Baggage Check-In Form */}
        <div className="card">
          <form onSubmit={handleCheckIn} className="space-y-6">
            {/* Baggage Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-2" />
                Number of Bags
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="input-field"
                placeholder="Enter number of bags"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum 10 bags per passenger
              </p>
            </div>

            {/* Baggage Weight */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Scale className="w-4 h-4 inline mr-2" />
                Total Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1000"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="input-field"
                placeholder="Enter total weight in kilograms"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the combined weight of all bags
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please ensure your baggage meets airline weight and size restrictions.
                Oversized or overweight baggage may incur additional fees.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                Skip (No Baggage)
              </button>
              <button
                type="submit"
                disabled={isLoading || !weight || !count}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Check In Baggage
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

