import { CheckCircle, Download, Info, Plane, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import logo from '../assets/image/logo.png';
import { boardingPassApi } from '../services/api';
import { useKioskStore } from '../store/kioskStore';

export default function BoardingPass() {
  const {
    booking,
    baggage,
    boardingPass,
    setBoardingPass,
    setLoading,
    setError,
    isLoading,
    reset,
  } = useKioskStore();
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!booking || boardingPass) return;

    const generateBoardingPass = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await boardingPassApi.generate(booking.bookingId);
        setBoardingPass(response.boardingPass);
        setGenerated(true);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to generate boarding pass';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    generateBoardingPass();
  }, [booking?.bookingId, boardingPass, setBoardingPass, setLoading, setError]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!booking) return;

    try {
      const blob = await boardingPassApi.getPdf(booking.bookingId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boarding-pass-${booking.bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  const handleNewCheckIn = () => {
    reset();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50"></div>
            <div className="relative inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-lg font-semibold text-gray-700">Generating your boarding pass...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!boardingPass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border-2 border-gray-200/50 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-700 font-semibold">Failed to generate boarding pass.</p>
          <p className="text-sm text-gray-500 mt-2">Please try again or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {generated && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r shadow-sm print:hidden">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-green-900">Check-In Complete!</h3>
                <p className="text-xs text-green-700 mt-0.5">
                  Your boarding pass is ready. Please proceed to your gate.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Boarding Pass - Professional Design */}
        <div className="bg-white shadow-lg print:shadow-none border border-gray-200 print:border-0 overflow-hidden">
          {/* Top Section - Header with QR Code */}
          <div className="bg-blue-600 text-white print:bg-white print:text-black">
            <div className="p-6 border-b-2 border-blue-700 print:border-gray-300">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={logo}
                    alt="Airline Logo"
                    className="h-12 w-auto object-contain print:grayscale print:brightness-0"
                  />
                  <div>
                    <h1 className="text-2xl font-bold tracking-wide mb-1">BOARDING PASS</h1>
                    {boardingPass.airlineName && (
                      <p className="text-xs font-medium text-blue-100 print:text-gray-600 mb-1">
                        {boardingPass.airlineName}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-blue-100 print:text-gray-700 mb-1">
                      {boardingPass.flightNumber}
                    </p>
                    <p className="text-xs font-medium text-blue-100 print:text-gray-600">
                      {formatDate(boardingPass.departureTime)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="bg-white p-2.5 rounded print:bg-transparent print:p-0 inline-block">
                    <QRCodeSVG
                      value={boardingPass.qrCode}
                      size={100}
                      className="print:border print:border-black"
                    />
                  </div>
                  <p className="text-xs font-medium mt-2 text-blue-100 print:text-gray-600">
                    Scan at Gate
                  </p>
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
                  {booking && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        BOOKING REFERENCE
                      </p>
                      <p className="text-base font-semibold text-gray-900 font-mono">
                        {booking.bookingId}
                      </p>
                    </div>
                  )}
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
                      {formatDate(boardingPass.departureTime)}
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
                  {baggage && (
                    <div className="flex flex-col">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        BAGGAGE
                      </p>
                      <div className="border border-gray-200 rounded p-4 flex-1 flex flex-col justify-center">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {baggage.baggageCount} bag(s) • {baggage.baggageWeight} kg
                        </p>
                        <p className="text-xs text-gray-600">Tag: {baggage.tagNumber}</p>
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
                      <p className="text-xl font-bold text-gray-900">{boardingPass.gate}</p>
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
                {baggage && <li>Baggage tags attached to your bags</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white shadow-lg p-4 border border-gray-200 print:hidden mt-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleNewCheckIn}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded text-sm transition-colors"
            >
              New Check-In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
