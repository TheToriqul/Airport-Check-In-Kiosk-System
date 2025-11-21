import {
  ArrowLeft,
  Clock,
  Eye,
  Info,
  Luggage,
  Mail,
  MapPin,
  Phone,
  Plane,
  User,
  Users,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import logo from '../assets/image/logo.png';
import { baggageApi, boardingPassApi, bookingApi, flightApi, seatApi } from '../services/api';
import { useKioskStore } from '../store/kioskStore';
import type { BoardingPass, Booking, Flight, SeatAssignment } from '../types';

interface PassengerWithDetails {
  bookingId: string;
  passengerName: string;
  passportNumber?: string;
  email?: string;
  phone?: string;
  seatNumber?: string;
  seatClass?: string;
  baggageCount?: number;
  baggageWeight?: number;
  baggageTagNumber?: string;
}

export default function FlightDetailsPage() {
  const { reset, setActivePage } = useKioskStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [passengers, setPassengers] = useState<PassengerWithDetails[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerWithDetails | null>(null);
  const [boardingPass, setBoardingPass] = useState<BoardingPass | null>(null);
  const [loadingBoardingPass, setLoadingBoardingPass] = useState(false);

  useEffect(() => {
    const loadFlights = async () => {
      setLoading(true);
      try {
        const flightsData = await flightApi.getAll();
        setFlights(flightsData);
      } catch (error) {
        console.error('Failed to load flights:', error);
        setFlights([]);
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
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isPastFlight = (departureTime: string) => {
    return new Date(departureTime) < new Date();
  };

  useEffect(() => {
    if (selectedFlight) {
      loadPassengers(selectedFlight.flightId);
    } else {
      setPassengers([]);
    }
  }, [selectedFlight]);

  const loadPassengers = async (flightId: string) => {
    setLoadingPassengers(true);
    try {
      // Fetch all bookings (passengers) for this flight
      const bookings = await bookingApi.getByFlightId(flightId);

      // Fetch seat assignments (if any)
      let seatAssignments: SeatAssignment[] = [];
      try {
        const seatResponse = await seatApi.getSeatAssignments(flightId);
        seatAssignments = seatResponse.assignments;
      } catch (error) {
        console.warn('No seat assignments found for flight:', error);
      }

      // Fetch baggage info
      let baggageDebugData: any = null;
      try {
        baggageDebugData = await baggageApi.getDebug(flightId);
      } catch (error) {
        console.warn('Failed to load baggage debug data:', error);
      }

      // Merge bookings with seat assignments and baggage info
      const passengersWithDetails: PassengerWithDetails[] = bookings.map((booking: Booking) => {
        // Find seat assignment for this booking
        const seatAssignment = seatAssignments.find((seat) => seat.bookingId === booking.bookingId);

        // Find baggage info for this booking
        let baggageInfo = null;
        if (baggageDebugData?.records) {
          baggageInfo = baggageDebugData.records.find(
            (r: any) => r.bookingId === booking.bookingId
          );
        }

        // Build passenger details
        const passenger: PassengerWithDetails = {
          bookingId: booking.bookingId,
          passengerName: booking.passengerName,
          passportNumber: booking.passportNumber,
          email: booking.email,
          phone: booking.phone,
          seatNumber: seatAssignment?.seatNumber,
          seatClass: seatAssignment?.seatClass,
          baggageCount: baggageInfo?.baggageCount,
          baggageWeight: baggageInfo?.weight,
          baggageTagNumber: baggageInfo?.tagNumber,
        };

        return passenger;
      });

      setPassengers(passengersWithDetails);
    } catch (error) {
      console.error('Failed to load passengers:', error);
      setPassengers([]);
    } finally {
      setLoadingPassengers(false);
    }
  };

  const handlePassengerClick = async (passenger: PassengerWithDetails) => {
    setSelectedPassenger(passenger);
    setLoadingBoardingPass(true);
    setBoardingPass(null);

    try {
      const response = await boardingPassApi.generate(passenger.bookingId);
      setBoardingPass(response.boardingPass);
    } catch (error) {
      console.error('Failed to load boarding pass:', error);
    } finally {
      setLoadingBoardingPass(false);
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (selectedFlight) {
                  // If viewing flight details, go back to flight list
                  setSelectedFlight(null);
                  setPassengers([]);
                  setSelectedPassenger(null);
                  setBoardingPass(null);
                } else {
                  // If viewing flight list, go back to home
                  setActivePage(null);
                }
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {selectedFlight ? 'Back to Flights' : 'Back'}
            </button>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Airport Logo" className="h-12 w-auto object-contain" />
              <div>
                <h1 className="text-3xl font-extrabold gradient-text">Flight Information</h1>
                <p className="text-gray-600">View flight schedules and passenger details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Flight List */}
        {!selectedFlight && (
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Plane className="w-8 h-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">All Flights</h2>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {flights.length} {flights.length === 1 ? 'Flight' : 'Flights'}
              </span>
            </div>

            {flights.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">No flights available</p>
                <p className="text-sm text-gray-500">
                  There are no upcoming flights in the system at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <div
                    key={flight.flightId}
                    onClick={() => setSelectedFlight(flight)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isPastFlight(flight.departureTime)
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400 opacity-75'
                        : 'bg-gradient-to-r from-white to-blue-50 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          <Plane className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              {flight.airlineName && (
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                  {flight.airlineName}
                                </p>
                              )}
                              <h3 className="text-2xl font-bold text-gray-900">
                                {flight.flightNumber}
                              </h3>
                              {flight.aircraftType && (
                                <p className="text-xs font-medium text-gray-500 mt-1">
                                  {flight.aircraftType}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(flight.flightStatus)}`}
                            >
                              {flight.flightStatus}
                            </span>
                            {isPastFlight(flight.departureTime) && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-200 text-gray-700 border-gray-400">
                                DEPARTED
                              </span>
                            )}
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
                          <p className="text-lg font-bold text-gray-900">
                            {formatTime(flight.departureTime)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate(flight.departureTime)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            {flight.availableSeats} / {flight.totalSeats} seats available
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Flight Details with Passengers */}
        {selectedFlight && (
          <div className="space-y-6">
            {/* Flight Details Card - Compact Header */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    {selectedFlight.airlineName && (
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {selectedFlight.airlineName}
                      </p>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedFlight.flightNumber}
                    </h2>
                    {selectedFlight.aircraftType && (
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        {selectedFlight.aircraftType}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {selectedFlight.departureAirport} → {selectedFlight.arrivalAirport}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedFlight.flightStatus)}`}
                  >
                    {selectedFlight.flightStatus}
                  </span>
                </div>
              </div>

              {/* Flight Info Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="text-xs font-semibold text-gray-600 uppercase">Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedFlight.departureAirport}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(selectedFlight.departureTime)}
                      </p>
                    </div>
                    <span className="text-primary-600">→</span>
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedFlight.arrivalAirport}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(selectedFlight.arrivalTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span className="text-xs font-semibold text-gray-600 uppercase">Departure</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatTime(selectedFlight.departureTime)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(selectedFlight.departureTime)}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span className="text-xs font-semibold text-gray-600 uppercase">Arrival</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatTime(selectedFlight.arrivalTime)}
                  </p>
                  <p className="text-xs text-gray-600">{formatDate(selectedFlight.arrivalTime)}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span className="text-xs font-semibold text-gray-600 uppercase">Seats</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedFlight.availableSeats} / {selectedFlight.totalSeats}
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-primary-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(selectedFlight.availableSeats / selectedFlight.totalSeats) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers List - Professional Table Layout */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Passengers</h2>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {passengers.length}
                  </span>
                </div>
              </div>

              {loadingPassengers ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                  <p className="text-gray-600">Loading passengers...</p>
                </div>
              ) : passengers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No passengers found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    There are no bookings for this flight
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary-50 to-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Passenger
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Seat
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Baggage
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {passengers.map((passenger) => (
                        <tr
                          key={passenger.bookingId}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {passenger.passengerName}
                                </p>
                                {passenger.passportNumber && (
                                  <p className="text-xs text-gray-500">
                                    Passport: {passenger.passportNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {passenger.seatNumber ? (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg font-bold text-base">
                                  {passenger.seatNumber}
                                </span>
                                {passenger.seatClass && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                                    {passenger.seatClass.toLowerCase()}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Not assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-mono text-gray-900">{passenger.bookingId}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {passenger.email && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate max-w-[200px]">{passenger.email}</span>
                                </div>
                              )}
                              {passenger.phone && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Phone className="w-3 h-3" />
                                  <span>{passenger.phone}</span>
                                </div>
                              )}
                              {!passenger.email && !passenger.phone && (
                                <span className="text-xs text-gray-400">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {passenger.baggageCount !== undefined ? (
                              <div className="flex items-center gap-2">
                                <Luggage className="w-4 h-4 text-primary-600" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {passenger.baggageCount} bag
                                    {passenger.baggageCount !== 1 ? 's' : ''}
                                  </p>
                                  {passenger.baggageWeight && (
                                    <p className="text-xs text-gray-500">
                                      {passenger.baggageWeight} kg
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No baggage</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handlePassengerClick(passenger)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              View Pass
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Boarding Pass Modal */}
        {selectedPassenger && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <h3 className="text-2xl font-bold text-gray-900">Boarding Pass</h3>
                <button
                  onClick={() => {
                    setSelectedPassenger(null);
                    setBoardingPass(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {loadingBoardingPass ? (
                  <div className="text-center py-12">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50"></div>
                      <div className="relative inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">
                      Generating boarding pass...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
                  </div>
                ) : boardingPass ? (
                  <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
                    {/* Top Section - Header with QR Code */}
                    <div className="bg-blue-600 text-white">
                      <div className="p-6 border-b-2 border-blue-700">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <img
                              src={logo}
                              alt="Airline Logo"
                              className="h-12 w-auto object-contain"
                            />
                            <div>
                              <h1 className="text-2xl font-bold tracking-wide mb-1">
                                BOARDING PASS
                              </h1>
                              {boardingPass.airlineName && (
                                <p className="text-xs font-medium text-blue-100 mb-1">
                                  {boardingPass.airlineName}
                                </p>
                              )}
                              <p className="text-sm font-semibold text-blue-100 mb-1">
                                {boardingPass.flightNumber}
                              </p>
                              <p className="text-xs font-medium text-blue-100">
                                {formatDateFull(boardingPass.departureTime)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="bg-white p-2.5 rounded inline-block">
                              <QRCodeSVG value={boardingPass.qrCode} size={100} />
                            </div>
                            <p className="text-xs font-medium mt-2 text-blue-100">Scan at Gate</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content - Two Column Layout */}
                    <div className="p-6">
                      <div className="relative grid md:grid-cols-2 gap-8 border-b border-gray-200 pb-6 mb-6">
                        {/* Vertical Center Line */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-gray-400 transform -translate-x-1/2"></div>

                        {/* Left Column */}
                        <div className="space-y-5 relative z-10 flex flex-col">
                          {/* Passenger and Booking Reference in Same Row */}
                          <div className="grid grid-cols-2 gap-6">
                            {/* Passenger */}
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                PASSENGER
                              </p>
                              <p className="text-base font-semibold text-gray-900">
                                {boardingPass.passengerName}
                              </p>
                            </div>

                            {/* Booking Reference */}
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                BOOKING REFERENCE
                              </p>
                              <p className="text-base font-semibold text-gray-900 font-mono">
                                {boardingPass.bookingId}
                              </p>
                            </div>
                          </div>

                          {/* Flight Details */}
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                FLIGHT
                              </p>
                              {boardingPass.airlineName && (
                                <p className="text-xs font-medium text-gray-600 mb-1">
                                  {boardingPass.airlineName}
                                </p>
                              )}
                              <p className="text-base font-semibold text-gray-900">
                                {boardingPass.flightNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                DATE
                              </p>
                              <p className="text-base font-semibold text-gray-900">
                                {formatDateFull(boardingPass.departureTime)}
                              </p>
                            </div>
                          </div>

                          {/* Route */}
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                              ROUTE
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <p className="text-xl font-bold text-gray-900 mb-1">
                                  {boardingPass.departureAirport}
                                </p>
                                <p className="text-sm text-gray-600 font-medium">
                                  {formatTime(boardingPass.departureTime)}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <div className="w-10 border-t-2 border-dashed border-gray-400"></div>
                                <Plane className="w-5 h-5 text-gray-500 mx-1.5" />
                                <div className="w-10 border-t-2 border-dashed border-gray-400"></div>
                              </div>
                              <div className="flex-1 text-right">
                                <p className="text-xl font-bold text-gray-900 mb-1">
                                  {boardingPass.arrivalAirport}
                                </p>
                                <p className="text-sm text-gray-600 font-medium">
                                  {formatTime(boardingPass.arrivalTime)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-5 relative z-10 flex flex-col">
                          {/* Seat Details and Baggage in Same Row */}
                          <div className="grid grid-cols-2 gap-6">
                            {/* Seat Details Section */}
                            <div className="flex flex-col">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                SEAT DETAILS
                              </p>
                              <div className="bg-blue-50 border border-blue-200 rounded p-4 flex-1 flex flex-col justify-center">
                                <p className="text-4xl font-bold text-blue-600 mb-1">
                                  {boardingPass.seatNumber}
                                </p>
                                <p className="text-xs text-gray-600 font-medium">Seat Assignment</p>
                              </div>
                            </div>

                            {/* Baggage Info */}
                            {selectedPassenger.baggageCount !== undefined && (
                              <div className="flex flex-col">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                  BAGGAGE
                                </p>
                                <div className="border border-gray-200 rounded p-4 flex-1 flex flex-col justify-center">
                                  <p className="text-sm font-semibold text-gray-900 mb-1">
                                    {selectedPassenger.baggageCount} bag(s) •{' '}
                                    {selectedPassenger.baggageWeight || 'N/A'} kg
                                  </p>
                                  {selectedPassenger.baggageTagNumber && (
                                    <p className="text-xs text-gray-600">
                                      Tag: {selectedPassenger.baggageTagNumber}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Gate & Boarding Time */}
                          <div className="grid grid-cols-2 gap-6">
                            {boardingPass.gate && (
                              <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                  GATE
                                </p>
                                <p className="text-xl font-bold text-gray-900">
                                  {boardingPass.gate}
                                </p>
                              </div>
                            )}
                            {boardingPass.boardingTime && (
                              <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                  BOARDING
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                  {formatTime(boardingPass.boardingTime)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Aircraft Type - Third Row */}
                          {boardingPass.aircraftType && (
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                AIRCRAFT
                              </p>
                              <p className="text-base font-semibold text-gray-900">
                                {boardingPass.aircraftType}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Section - Additional Info */}
                      <div className="text-xs text-gray-600">
                        <p className="font-bold mb-1.5">Important:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Arrive at gate 30 minutes before departure</li>
                          <li>Have boarding pass and ID ready</li>
                          {selectedPassenger.baggageCount !== undefined && (
                            <li>Baggage tags attached to your bags</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border-2 border-gray-200/50 max-w-md text-center mx-auto">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Info className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-gray-700 font-semibold">Failed to generate boarding pass.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please try again or contact support.
                    </p>
                  </div>
                )}
              </div>
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
