import { ArrowLeft, Plane, MapPin, Clock, Users, Info, User, Ticket } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useKioskStore } from '../store/kioskStore';
import { seatApi } from '../services/api';
import logo from '../assets/image/logo.png';
import type { Flight, SeatAssignment } from '../types';

export default function FlightDetailsPage() {
  const { reset, setActivePage } = useKioskStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [seatAssignments, setSeatAssignments] = useState<SeatAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use sample data
    const loadFlights = async () => {
      setLoading(true);
      try {
        // This would be: const data = await flightApi.getAllFlights();
        // For demo, using sample data structure
        setFlights([
          {
            flightId: 'FL001',
            flightNumber: 'AA1234',
            departureAirport: 'JFK',
            arrivalAirport: 'LAX',
            departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            arrivalTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            totalSeats: 180,
            availableSeats: 45,
            flightStatus: 'SCHEDULED'
          },
          {
            flightId: 'FL002',
            flightNumber: 'AA5678',
            departureAirport: 'LAX',
            arrivalAirport: 'JFK',
            departureTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
            totalSeats: 180,
            availableSeats: 120,
            flightStatus: 'SCHEDULED'
          },
          {
            flightId: 'FL003',
            flightNumber: 'AA9012',
            departureAirport: 'JFK',
            arrivalAirport: 'SFO',
            departureTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            arrivalTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
            totalSeats: 200,
            availableSeats: 78,
            flightStatus: 'BOARDING'
          }
        ]);
      } catch (error) {
        console.error('Failed to load flights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (selectedFlight) {
      loadSeatAssignments(selectedFlight.flightId);
    } else {
      setSeatAssignments([]);
    }
  }, [selectedFlight]);

  const loadSeatAssignments = async (flightId: string) => {
    setLoadingAssignments(true);
    try {
      const response = await seatApi.getSeatAssignments(flightId);
      setSeatAssignments(response.assignments);
    } catch (error) {
      console.error('Failed to load seat assignments:', error);
      setSeatAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'BOARDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DEPARTED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading flight information...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-extrabold gradient-text">Flight Information</h1>
                <p className="text-gray-600">View flight schedules and details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Flight List */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Plane className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Today's Flights</h2>
          </div>

          <div className="space-y-4">
            {flights.map((flight) => (
              <div
                key={flight.flightId}
                onClick={() => setSelectedFlight(flight)}
                className="p-5 bg-gradient-to-r from-white to-blue-50 rounded-xl border-2 border-gray-200 hover:border-primary-300 cursor-pointer transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      <Plane className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{flight.flightNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(flight.flightStatus)}`}>
                          {flight.flightStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="font-semibold">{flight.departureAirport}</span>
                          <span className="text-primary-600">→</span>
                          <span className="font-semibold">{flight.arrivalAirport}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Departure</p>
                      <p className="text-lg font-bold text-gray-900">{formatTime(flight.departureTime)}</p>
                      <p className="text-xs text-gray-600">{formatDate(flight.departureTime)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{flight.availableSeats} / {flight.totalSeats} seats available</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Flight Details */}
        {selectedFlight && (
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Flight Details</h2>
              <button
                onClick={() => setSelectedFlight(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-700">Flight Number</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedFlight.flightNumber}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-700">Route</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedFlight.departureAirport}</p>
                      <p className="text-sm text-gray-600">Departure</p>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="border-t-2 border-dashed border-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedFlight.arrivalAirport}</p>
                      <p className="text-sm text-gray-600">Arrival</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-700">Departure Time</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatTime(selectedFlight.departureTime)}</p>
                  <p className="text-sm text-gray-600">{formatDate(selectedFlight.departureTime)}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-700">Arrival Time</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatTime(selectedFlight.arrivalTime)}</p>
                  <p className="text-sm text-gray-600">{formatDate(selectedFlight.arrivalTime)}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-700">Seat Availability</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedFlight.availableSeats} / {selectedFlight.totalSeats}
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${(selectedFlight.availableSeats / selectedFlight.totalSeats) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 mb-1">Important Information</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Please arrive at the gate at least 30 minutes before departure</li>
                    <li>• Boarding begins 45 minutes before scheduled departure time</li>
                    <li>• Gate information will be displayed on airport screens</li>
                    <li>• Check-in closes 60 minutes before departure</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Seat Assignments Section */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Ticket className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Seat Assignments</h2>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  {seatAssignments.length} {seatAssignments.length === 1 ? 'Passenger' : 'Passengers'}
                </span>
              </div>

              {loadingAssignments ? (
                <div className="card text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                  <p className="text-gray-600">Loading seat assignments...</p>
                </div>
              ) : seatAssignments.length === 0 ? (
                <div className="card text-center py-8 bg-gray-50">
                  <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No seat assignments yet</p>
                  <p className="text-sm text-gray-500 mt-1">Seats will appear here once passengers complete check-in</p>
                </div>
              ) : (
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-primary-50 to-blue-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Passenger
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Seat
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Booking ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Passport
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {seatAssignments.map((assignment) => (
                          <tr key={assignment.seatId} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{assignment.passengerName}</p>
                                  {assignment.email && (
                                    <p className="text-xs text-gray-500">{assignment.email}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg font-bold text-sm">
                                {assignment.seatNumber}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                                {assignment.seatClass.toLowerCase()}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm font-mono text-gray-700">{assignment.bookingId}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{assignment.passportNumber || 'N/A'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!selectedFlight && (
          <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Need to Check-In?</h3>
            <p className="text-gray-700 mb-4">
              If you have a booking, you can start the check-in process from the home page.
            </p>
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
        )}
      </div>
    </div>
  );
}

