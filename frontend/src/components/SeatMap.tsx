import clsx from 'clsx';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Lock,
  Mail,
  Phone,
  Plane,
  Square,
  Ticket,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/image/logo.png';
import { seatApi } from '../services/api';
import { wsService } from '../services/websocket';
import { useKioskStore } from '../store/kioskStore';
import type { Seat } from '../types';

export default function SeatMap() {
  const {
    booking,
    flight,
    seats,
    selectedSeat,
    sessionId,
    setSeats,
    updateSeat,
    setSelectedSeat,
    setCurrentStep,
    setLoading,
    setError,
    isLoading,
  } = useKioskStore();

  const [lockingSeat, setLockingSeat] = useState<string | null>(null);

  useEffect(() => {
    if (!flight) return;

    const loadSeats = async () => {
      setLoading(true);
      try {
        const response = await seatApi.getSeatMap(flight.flightId);
        setSeats(response.seats);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load seat map';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadSeats();

    // Subscribe to seat updates via WebSocket
    wsService.connect();
    const handleSeatUpdate = (event: { seatId: string; status: string }) => {
      const currentSeats = useKioskStore.getState().seats;
      const updatedSeat = currentSeats.find((s) => s.seatId === event.seatId);
      if (updatedSeat) {
        updateSeat({ ...updatedSeat, seatStatus: event.status as Seat['seatStatus'] });
        // If the selected seat was released by another user, clear selection
        const currentSelectedSeat = useKioskStore.getState().selectedSeat;
        if (currentSelectedSeat?.seatId === event.seatId && event.status === 'AVAILABLE') {
          setSelectedSeat(null);
        }
      }
    };

    wsService.subscribeToSeatUpdates(flight.flightId, handleSeatUpdate);

    // Cleanup: Note - WebSocket service manages subscriptions internally
    // We don't need to unsubscribe here as the service handles it
    return () => {
      // Component cleanup handled by WebSocket service
    };
  }, [flight, setSeats, setLoading, setError, updateSeat, setSelectedSeat]);

  const handleSeatClick = async (seat: Seat) => {
    if (seat.seatStatus !== 'AVAILABLE' || lockingSeat) return;

    setLockingSeat(seat.seatId);
    setError(null);

    try {
      // Unlock previously selected seat if user clicks a different seat
      if (selectedSeat && selectedSeat.seatId !== seat.seatId) {
        try {
          await seatApi.unlockSeat(flight!.flightId, selectedSeat.seatId, sessionId);
          updateSeat({ ...selectedSeat, seatStatus: 'AVAILABLE', lockedBy: undefined });
          setSelectedSeat(null); // Clear the previous selection
        } catch (error) {
          // Ignore unlock errors, continue with new seat selection
          console.warn('Failed to unlock previous seat:', error);
          setSelectedSeat(null); // Clear selection even if unlock fails
        }
      }

      const success = await seatApi.lockSeat(flight!.flightId, seat.seatId, { sessionId });
      if (success) {
        setSelectedSeat(seat);
        updateSeat({ ...seat, seatStatus: 'LOCKED', lockedBy: sessionId });
      } else {
        setError('Seat is no longer available. Please select another seat.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to lock seat';
      setError(message);
    } finally {
      setLockingSeat(null);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSeat || !booking || !flight) return;

    setLoading(true);
    try {
      const success = await seatApi.confirmSeat(flight.flightId, selectedSeat.seatId, {
        bookingId: booking.bookingId,
        sessionId,
      });
      if (success) {
        setCurrentStep('baggage');
      } else {
        setError('Failed to confirm seat selection. Please try again.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to confirm seat';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedSeat) {
      seatApi.unlockSeat(flight!.flightId, selectedSeat.seatId, sessionId);
      setSelectedSeat(null);
    }
    useKioskStore.getState().reset();
  };

  const getSeatClass = (seat: Seat): string => {
    if (seat.seatId === selectedSeat?.seatId) {
      return 'seat-selected';
    }
    switch (seat.seatStatus) {
      case 'AVAILABLE':
        return 'seat-available';
      case 'LOCKED':
        return 'seat-locked';
      case 'RESERVED':
      case 'OCCUPIED':
        return 'seat-reserved';
      default:
        return 'seat-available';
    }
  };

  // Group seats by class and row, and identify seat positions
  const groupedSeats = seats.reduce(
    (acc, seat) => {
      const row = seat.seatNumber.match(/\d+/)?.[0] || '0';
      const classKey = seat.seatClass;
      if (!acc[classKey]) acc[classKey] = {};
      if (!acc[classKey][row]) acc[classKey][row] = [];
      acc[classKey][row].push(seat);
      return acc;
    },
    {} as Record<string, Record<string, Seat[]>>
  );

  // Helper function to determine seat position (window, middle, aisle)
  const getSeatPosition = (seatNumber: string, rowSeats: Seat[]): 'window' | 'middle' | 'aisle' => {
    const sortedSeats = [...rowSeats].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
    const index = sortedSeats.findIndex((s) => s.seatNumber === seatNumber);
    const total = sortedSeats.length;

    if (index === 0 || index === total - 1) return 'window';
    if (total <= 3) return 'middle';
    // For typical configurations: A/B are window, C/D/E/F are middle/aisle depending on config
    const letter = seatNumber.slice(-1);
    if (['A', 'F'].includes(letter)) return 'window';
    if (['C', 'D'].includes(letter)) return 'middle';
    return 'aisle';
  };

  // Check if there's an aisle in the row (typically between C-D or D-E)
  const hasAisle = (rowSeats: Seat[]): number => {
    const sortedSeats = [...rowSeats].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
    if (sortedSeats.length <= 3) return -1;
    // Typical configuration: aisle between C-D or D-E
    const letters = sortedSeats.map((s) => s.seatNumber.slice(-1));
    const cIndex = letters.indexOf('C');
    const dIndex = letters.indexOf('D');
    if (cIndex >= 0 && dIndex >= 0 && dIndex === cIndex + 1) return cIndex + 0.5;
    return -1;
  };

  return (
    <div className="min-h-full p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto">
        {/* Header - Professional Airport Kiosk Style */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border-2 border-gray-200/50">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-200/30 rounded-full blur-lg"></div>
                <img
                  src={logo}
                  alt="Airport Logo"
                  className="h-16 w-auto object-contain relative z-10"
                />
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-extrabold text-gray-900">Select Your Seat</h1>
                <div className="flex items-center gap-2 mt-1 text-gray-600 font-medium">
                  <Plane className="w-5 h-5 text-primary-600" />
                  {flight?.airlineName && (
                    <>
                      <span className="font-semibold">{flight.airlineName}</span>
                      <span className="mx-1">•</span>
                    </>
                  )}
                  <span className="font-semibold">{flight?.flightNumber}</span>
                  {flight?.aircraftType && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-xs font-normal">{flight.aircraftType}</span>
                    </>
                  )}
                  <ArrowRight className="w-4 h-4" />
                  <span>{flight?.departureAirport}</span>
                  <span className="text-primary-600">→</span>
                  <span>{flight?.arrivalAirport}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left Column - Seat Map */}
          <div className="flex-1 lg:w-2/3 flex flex-col">
            {/* Seat Map - Realistic Airplane Cabin Layout */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border-2 border-gray-200/50 flex-1 flex flex-col">
              {/* Cockpit Indicator */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-4 rounded-xl shadow-2xl border-2 border-gray-700">
                  <Plane className="w-7 h-7" />
                  <span className="font-bold text-xl tracking-wide">COCKPIT</span>
                </div>
              </div>

              {/* Window Indicators */}
              <div className="flex justify-between items-center mb-4 px-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Square className="w-5 h-5" />
                  <span className="text-sm font-semibold">Window</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm font-semibold">Window</span>
                  <Square className="w-5 h-5" />
                </div>
              </div>

              {Object.entries(groupedSeats).map(([seatClass, rows]) => {
                const classColors = {
                  FIRST: 'from-purple-50 to-indigo-50 border-purple-200',
                  BUSINESS: 'from-blue-50 to-cyan-50 border-blue-200',
                  ECONOMY: 'from-gray-50 to-slate-50 border-gray-200',
                };
                const classBg =
                  classColors[seatClass as keyof typeof classColors] || classColors.ECONOMY;

                return (
                  <div key={seatClass} className="mb-8 last:mb-0">
                    {/* Class Header */}
                    <div className={`bg-gradient-to-r ${classBg} p-4 rounded-xl border-2 mb-6`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-extrabold text-gray-900 capitalize flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              seatClass === 'FIRST'
                                ? 'bg-purple-600'
                                : seatClass === 'BUSINESS'
                                  ? 'bg-blue-600'
                                  : 'bg-gray-600'
                            }`}
                          ></div>
                          {seatClass} Class
                        </h3>
                        <div className="text-sm text-gray-600 font-semibold">
                          {
                            seats.filter(
                              (s) => s.seatClass === seatClass && s.seatStatus === 'AVAILABLE'
                            ).length
                          }{' '}
                          seats available
                        </div>
                      </div>
                    </div>

                    {/* Seat Rows */}
                    <div className="space-y-2">
                      {Object.entries(rows)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([row, rowSeats]) => {
                          const sortedSeats = [...rowSeats].sort((a, b) =>
                            a.seatNumber.localeCompare(b.seatNumber)
                          );
                          const aislePosition = hasAisle(rowSeats);

                          return (
                            <div key={row} className="flex items-center gap-2 group">
                              {/* Row Number */}
                              <div className="w-12 text-center font-bold text-gray-800 text-base bg-gray-100 py-3 rounded-lg border border-gray-300">
                                {row}
                              </div>

                              {/* Seats with Aisle */}
                              <div className="flex-1 flex items-center gap-1.5 justify-center">
                                {sortedSeats.map((seat, index) => {
                                  const position = getSeatPosition(seat.seatNumber, rowSeats);
                                  const shouldShowAisleAfter =
                                    aislePosition >= 0 && Math.floor(aislePosition) === index;

                                  return (
                                    <div key={seat.seatId} className="relative flex items-center">
                                      <button
                                        onClick={() => handleSeatClick(seat)}
                                        disabled={
                                          seat.seatStatus !== 'AVAILABLE' ||
                                          lockingSeat === seat.seatId ||
                                          isLoading
                                        }
                                        className={clsx(
                                          'w-12 h-12 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center relative group/seat',
                                          getSeatClass(seat),
                                          (seat.seatStatus !== 'AVAILABLE' || lockingSeat) &&
                                            'cursor-not-allowed',
                                          'hover:z-20',
                                          position === 'window' &&
                                            seat.seatStatus === 'AVAILABLE' &&
                                            'ring-2 ring-blue-300/50'
                                        )}
                                        title={`${seat.seatNumber} - ${seat.seatClass} Class - ${position}`}
                                      >
                                        {seat.seatStatus === 'LOCKED' &&
                                          seat.lockedBy !== sessionId && (
                                            <Lock className="w-4 h-4 animate-pulse" />
                                          )}
                                        {seat.seatStatus === 'RESERVED' && (
                                          <X className="w-4 h-4" />
                                        )}
                                        {seat.seatId === selectedSeat?.seatId && (
                                          <Check className="w-5 h-5" />
                                        )}
                                        {seat.seatStatus === 'AVAILABLE' &&
                                          seat.seatId !== selectedSeat?.seatId && (
                                            <span className="text-xs font-bold">
                                              {seat.seatNumber.slice(-1)}
                                            </span>
                                          )}
                                      </button>
                                      {/* Aisle Indicator after this seat */}
                                      {shouldShowAisleAfter && (
                                        <div className="w-6 h-12 flex items-center justify-center mx-0.5">
                                          <div className="w-0.5 h-full bg-gray-400 rounded-full"></div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}

              {/* Exit Row Indicators (if applicable) */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-semibold">Emergency Exit</span>
                  </div>
                </div>
              </div>

              {/* Seat Legend - Horizontal Layout */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary-600 rounded-full"></div>
                  Seat Legend
                </h3>
                <div className="flex flex-wrap items-center gap-4 justify-center">
                  {/* Available */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="w-10 h-10 rounded-lg seat-available flex items-center justify-center font-bold text-green-800 shadow-md text-xs">
                      A
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Available</p>
                    </div>
                  </div>
                  {/* Selected */}
                  <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg border-2 border-primary-200">
                    <div className="w-10 h-10 rounded-lg seat-selected flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Selected</p>
                    </div>
                  </div>
                  {/* Locked */}
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <div className="w-10 h-10 rounded-lg seat-locked flex items-center justify-center shadow-md">
                      <Lock className="w-4 h-4 text-yellow-800" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Locked</p>
                    </div>
                  </div>
                  {/* Reserved */}
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="w-10 h-10 rounded-lg seat-reserved flex items-center justify-center shadow-md">
                      <X className="w-4 h-4 text-red-800" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Reserved</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Passenger Details, Legend, and Confirmation */}
          <div className="w-full lg:w-1/3 flex flex-col">
            {/* Passenger Details */}
            {booking && (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200/50 shadow-lg flex-1 flex flex-col">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <User className="w-6 h-6 text-primary-600" />
                    Passenger Details
                  </h2>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Passenger Name */}
                  <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <User className="w-4 h-4" />
                      <p className="text-xs font-semibold uppercase">Passenger Name</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{booking.passengerName}</p>
                  </div>

                  {/* Booking Reference */}
                  <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Ticket className="w-4 h-4" />
                      <p className="text-xs font-semibold uppercase">Booking Reference</p>
                    </div>
                    <p className="text-lg font-bold text-primary-700 font-mono">
                      {booking.bookingId}
                    </p>
                  </div>

                  {/* Current Seat Assignment */}
                  {(() => {
                    const currentSeat = seats.find(
                      (s) =>
                        s.bookingId &&
                        s.bookingId.toUpperCase() === booking.bookingId.toUpperCase() &&
                        (s.seatStatus === 'RESERVED' || s.seatStatus === 'OCCUPIED')
                    );
                    return (
                      <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Plane className="w-4 h-4" />
                          <p className="text-xs font-semibold uppercase">Current Seat</p>
                        </div>
                        {currentSeat ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-extrabold text-primary-700">
                              {currentSeat.seatNumber}
                            </span>
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold capitalize">
                              {currentSeat.seatClass.toLowerCase()}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No seat assigned</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Passport Number */}
                  {booking.passportNumber && (
                    <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Ticket className="w-4 h-4" />
                        <p className="text-xs font-semibold uppercase">Passport Number</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 font-mono">
                        {booking.passportNumber}
                      </p>
                    </div>
                  )}

                  {/* Email */}
                  {booking.email && (
                    <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Mail className="w-4 h-4" />
                        <p className="text-xs font-semibold uppercase">Email</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 break-all">{booking.email}</p>
                    </div>
                  )}

                  {/* Phone */}
                  {booking.phone && (
                    <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Phone className="w-4 h-4" />
                        <p className="text-xs font-semibold uppercase">Phone</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{booking.phone}</p>
                    </div>
                  )}

                  {/* Booking Status */}
                  <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <p className="text-xs font-semibold uppercase">Booking Status</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.bookingStatus === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : booking.bookingStatus === 'CHECKED_IN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.bookingStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Flight Information */}
                  {flight && (
                    <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Plane className="w-4 h-4" />
                        <p className="text-xs font-semibold uppercase">Flight</p>
                      </div>
                      {flight.airlineName && (
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          {flight.airlineName}
                        </p>
                      )}
                      <p className="text-lg font-bold text-gray-900">{flight.flightNumber}</p>
                      {flight.aircraftType && (
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          {flight.aircraftType}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {flight.departureAirport} → {flight.arrivalAirport}
                      </p>
                    </div>
                  )}

                  {/* Departure Time */}
                  {flight && (
                    <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <p className="text-xs font-semibold uppercase">Departure Time</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(flight.departureTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmation Panel - Inside Passenger Details Card */}
                {selectedSeat && (
                  <div className="mt-6 pt-6 border-t-2 border-gray-300">
                    <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl shadow-lg p-5 border-2 border-green-400/50">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-green-400 rounded-xl blur-md opacity-50"></div>
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg relative z-10">
                              <Check className="w-7 h-7 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Selected Seat
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-extrabold text-gray-900">
                                {selectedSeat.seatNumber}
                              </p>
                              <span className="px-2 py-1 bg-white/80 rounded-lg text-xs font-bold text-primary-700 capitalize border border-primary-200">
                                {selectedSeat.seatClass}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 font-medium">
                              {(() => {
                                const row = selectedSeat.seatNumber.match(/\d+/)?.[0] || '0';
                                const rowSeats = groupedSeats[selectedSeat.seatClass]?.[row] || [];
                                const position = getSeatPosition(selectedSeat.seatNumber, rowSeats);
                                return (
                                  position.charAt(0).toUpperCase() + position.slice(1) + ' Seat'
                                );
                              })()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleConfirm}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-base px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
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
                              <span>Confirming...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              <span>Confirm Selection</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
