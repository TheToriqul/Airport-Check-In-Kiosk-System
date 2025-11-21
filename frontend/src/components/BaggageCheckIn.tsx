import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Info,
  Luggage,
  Package,
  Plane,
  Scale,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/image/logo.png';
import { baggageApi } from '../services/api';
import { wsService } from '../services/websocket';
import { useKioskStore } from '../store/kioskStore';
import type { BaggageUpdateEvent } from '../types/baggage';

export default function BaggageCheckIn() {
  const {
    booking,
    flight,
    setBaggage,
    setBaggageCount,
    baggageCount,
    setCurrentStep,
    setLoading,
    setError,
    isLoading,
    error,
  } = useKioskStore();
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
    const updateHandler = (event: BaggageUpdateEvent) => {
      console.log('Baggage count update received:', event.count);
      setBaggageCount(event.count);
    };

    wsService.subscribeToBaggageUpdates(flight.flightId, updateHandler);

    // Cleanup: Note - WebSocket service manages subscriptions internally
    // The subscription will be automatically re-established on reconnect
    return () => {
      // The WebSocket service maintains subscriptions, so we don't need to unsubscribe here
      // The count will continue to update for all passengers viewing the same flight
    };
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

      // Refresh baggage count after successful check-in
      // This ensures the count is up-to-date (WebSocket should also update it)
      if (flight) {
        try {
          const countResponse = await baggageApi.getCount(flight.flightId);
          setBaggageCount(countResponse.count);
        } catch (error) {
          console.error('Failed to refresh baggage count:', error);
          // Continue anyway - WebSocket will update it
        }
      }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border-2 border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentStep('seat-selection')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-4">
              <img src={logo} alt="Airport Logo" className="h-12 w-auto object-contain" />
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Baggage Check-In</h1>
                {flight && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Plane className="w-4 h-4" />
                    {flight.airlineName && (
                      <>
                        <span className="font-medium">{flight.airlineName}</span>
                        <span className="mx-1">•</span>
                      </>
                    )}
                    <span className="font-medium">{flight.flightNumber}</span>
                    {flight.aircraftType && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="text-xs">{flight.aircraftType}</span>
                      </>
                    )}
                    <span className="mx-1">•</span>
                    <span>
                      {flight.departureAirport} → {flight.arrivalAirport}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          {/* Passenger Info Card */}
          {booking && (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 p-4 rounded-lg border border-blue-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Passenger
                  </p>
                  <p className="text-base font-bold text-gray-900">{booking.passengerName}</p>
                </div>
              </div>
              {flight && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-blue-200/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Departure Date</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {new Date(flight.departureTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Departure Time</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Baggage Statistics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Flight Baggage Statistics */}
            {flight && (
              <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-5 text-white border-2 border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                    <Luggage className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                      Total Checked
                    </p>
                    <p className="text-3xl font-bold">{baggageCount}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/90">Flight Capacity</span>
                    <span className="text-sm font-semibold">Unlimited</span>
                  </div>
                </div>
              </div>
            )}

            {/* Information Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-5 border border-gray-200/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Baggage Guidelines</h3>
              </div>
              <div className="space-y-2.5 text-xs text-gray-700 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-gray-700">Maximum 10 bags per passenger</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-gray-700">Single baggage: 25KG (Standard weight limit)</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-gray-700">Multiple baggage: 40KG (Standard weight limit)</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    Excess baggage (over 40KG): $50 per additional 5KG
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-gray-700">Oversized items may incur additional fees</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-gray-700">Prohibited items are not allowed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Check-In Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200/50">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  Baggage Details
                </h2>
                <p className="text-sm text-gray-600">Enter your baggage information below</p>
              </div>

              <form onSubmit={handleCheckIn} className="space-y-5">
                {/* Baggage Count */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Number of Bags</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base font-medium text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter number of bags"
                    required
                    disabled={isLoading}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Maximum 10 bags per passenger</p>
                </div>

                {/* Baggage Weight */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Scale className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span>Total Weight (kg)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base font-medium text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter total weight in kilograms"
                    required
                    disabled={isLoading}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the combined weight of all bags
                  </p>
                </div>

                {/* Warning Box */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900 mb-1">Important Notice</p>
                      <p className="text-xs text-amber-800">
                        Please ensure your baggage meets airline weight and size restrictions.
                        Oversized or overweight baggage may incur additional fees at the airport.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    Skip (No Baggage)
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !weight || !count}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Check In Baggage</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
