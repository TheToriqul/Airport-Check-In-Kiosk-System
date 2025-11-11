import clsx from 'clsx';
import { ArrowLeft, Check, Lock, Plane, X } from 'lucide-react';
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
    wsService.subscribeToSeatUpdates(flight.flightId, (event) => {
      const currentSeats = useKioskStore.getState().seats;
      const updatedSeat = currentSeats.find((s) => s.seatId === event.seatId);
      if (updatedSeat) {
        updateSeat({ ...updatedSeat, seatStatus: event.status });
        // If the selected seat was released by another user, clear selection
        const currentSelectedSeat = useKioskStore.getState().selectedSeat;
        if (currentSelectedSeat?.seatId === event.seatId && event.status === 'AVAILABLE') {
          setSelectedSeat(null);
        }
      }
    });
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

  // Group seats by class and row
  const groupedSeats = seats.reduce((acc, seat) => {
    const row = seat.seatNumber.match(/\d+/)?.[0] || '0';
    const classKey = seat.seatClass;
    if (!acc[classKey]) acc[classKey] = {};
    if (!acc[classKey][row]) acc[classKey][row] = [];
    acc[classKey][row].push(seat);
    return acc;
  }, {} as Record<string, Record<string, Seat[]>>);

  return (
    <div className="min-h-full p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <button
              onClick={handleBack}
              className="btn-secondary flex items-center gap-2 hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Search
            </button>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-200/30 rounded-full blur-lg"></div>
                <img
                  src={logo}
                  alt="Airport Logo"
                  className="h-14 w-auto object-contain relative z-10"
                />
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-extrabold gradient-text">Select Your Seat</h1>
                <p className="text-gray-600 font-medium mt-1">
                  {flight?.flightNumber} • {flight?.departureAirport} → {flight?.arrivalAirport}
                </p>
              </div>
            </div>
          </div>

          {booking && (
            <div className="bg-gradient-to-r from-primary-50 via-blue-50 to-cyan-50 p-5 rounded-2xl border-2 border-primary-200/50 shadow-md">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Passenger</p>
                  <p className="text-lg font-bold text-gray-900">{booking.passengerName}</p>
                </div>
                <div className="h-12 w-px bg-primary-200"></div>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Booking Reference
                  </p>
                  <p className="text-lg font-bold text-primary-700">{booking.bookingId}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seat Map */}
        <div className="card animate-slide-up">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-100 to-blue-100 px-6 py-3 rounded-full shadow-lg border-2 border-primary-200/50">
              <Plane className="w-6 h-6 text-primary-700 animate-float" />
              <span className="text-primary-700 font-bold text-lg">Cockpit</span>
            </div>
          </div>

          {Object.entries(groupedSeats).map(([seatClass, rows]) => (
            <div key={seatClass} className="mb-10 last:mb-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <h3 className="text-2xl font-extrabold gradient-text capitalize px-4">
                  {seatClass} Class
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
              <div className="space-y-3">
                {Object.entries(rows)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center gap-3 group">
                      <div className="w-14 text-center font-bold text-gray-700 text-lg bg-gray-100/50 py-2 rounded-lg">
                        {row}
                      </div>
                      <div className="flex-1 flex gap-2 justify-center flex-wrap">
                        {rowSeats
                          .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber))
                          .map((seat, index) => (
                            <button
                              key={seat.seatId}
                              onClick={() => handleSeatClick(seat)}
                              disabled={
                                seat.seatStatus !== 'AVAILABLE' ||
                                lockingSeat === seat.seatId ||
                                isLoading
                              }
                              className={clsx(
                                'w-14 h-14 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center relative',
                                getSeatClass(seat),
                                (seat.seatStatus !== 'AVAILABLE' || lockingSeat) &&
                                  'cursor-not-allowed',
                                'hover:z-20'
                              )}
                              title={`${seat.seatNumber} - ${seat.seatClass} Class`}
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              {seat.seatStatus === 'LOCKED' && seat.lockedBy !== sessionId && (
                                <Lock className="w-5 h-5 animate-pulse" />
                              )}
                              {seat.seatStatus === 'RESERVED' && <X className="w-5 h-5" />}
                              {seat.seatId === selectedSeat?.seatId && (
                                <Check className="w-6 h-6 animate-bounce-slow" />
                              )}
                              {seat.seatStatus === 'AVAILABLE' &&
                                seat.seatId !== selectedSeat?.seatId && (
                                  <span className="relative z-10">{seat.seatNumber.slice(-1)}</span>
                                )}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="card mt-6 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200/50">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors">
              <div className="w-10 h-10 rounded-xl seat-available flex items-center justify-center font-bold text-green-800">
                A
              </div>
              <span className="text-sm font-semibold text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors">
              <div className="w-10 h-10 rounded-xl seat-selected flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors">
              <div className="w-10 h-10 rounded-xl seat-locked flex items-center justify-center">
                <Lock className="w-5 h-5 text-yellow-800" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Locked</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors">
              <div className="w-10 h-10 rounded-xl seat-reserved flex items-center justify-center">
                <X className="w-5 h-5 text-red-800" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Reserved</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {selectedSeat && (
          <div className="card mt-6 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-300/50 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Selected Seat
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 mb-1">
                    {selectedSeat.seatNumber}
                  </p>
                  <p className="text-sm font-semibold text-primary-700 capitalize">
                    {selectedSeat.seatClass} Class
                  </p>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="btn-primary text-lg px-10 py-5 disabled:opacity-50 flex items-center gap-2 min-w-[200px] justify-center"
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
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
