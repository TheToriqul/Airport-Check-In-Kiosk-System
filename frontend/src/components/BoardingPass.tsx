import { useEffect, useState } from 'react';
import { Download, Printer, Plane, Calendar, MapPin, User, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { boardingPassApi } from '../services/api';
import { useKioskStore } from '../store/kioskStore';
import logo from '../assets/image/logo.png';

export default function BoardingPass() {
  const { booking, flight, baggage, boardingPass, setBoardingPass, setLoading, setError, isLoading, reset } = useKioskStore();
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
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Generating your boarding pass...</p>
        </div>
      </div>
    );
  }

  if (!boardingPass) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="card max-w-md text-center">
          <p className="text-gray-600">Failed to generate boarding pass. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {generated && (
          <div className="card mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-slide-up">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-bold text-green-900">Check-In Complete!</h3>
                <p className="text-sm text-green-700">Your boarding pass has been generated successfully.</p>
              </div>
            </div>
          </div>
        )}

        {/* Boarding Pass Card */}
        <div className="card mb-6 print:shadow-none print:border-2 print:border-dashed print:border-gray-400">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 rounded-t-2xl -m-6 mb-6 print:bg-white print:text-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={logo} 
                  alt="Airport Logo" 
                  className="h-16 w-auto object-contain print:grayscale print:brightness-0"
                />
                <div>
                  <h2 className="text-2xl font-bold mb-1">BOARDING PASS</h2>
                  <p className="text-primary-100 print:text-gray-600">{flight?.flightNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/20 print:bg-transparent rounded-lg p-3 print:p-0">
                  <QRCodeSVG 
                    value={boardingPass.qrCode} 
                    size={80}
                    className="print:border-2 print:border-black"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Passenger</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{boardingPass.passengerName}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Plane className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Flight</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{boardingPass.flightNumber}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{boardingPass.departureAirport}</p>
                    <p className="text-sm text-gray-600">{formatTime(boardingPass.departureTime)}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="border-t-2 border-dashed border-gray-300"></div>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{boardingPass.arrivalAirport}</p>
                    <p className="text-sm text-gray-600">{formatTime(boardingPass.arrivalTime)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <span className="text-xs font-semibold uppercase">Seat</span>
                </div>
                <p className="text-3xl font-bold text-primary-600">{boardingPass.seatNumber}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Departure</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatDate(boardingPass.departureTime)}</p>
                <p className="text-sm text-gray-600">{formatTime(boardingPass.departureTime)}</p>
              </div>

              {boardingPass.gate && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <span className="text-xs font-semibold uppercase">Gate</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{boardingPass.gate}</p>
                </div>
              )}

              {boardingPass.boardingTime && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <span className="text-xs font-semibold uppercase">Boarding</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formatTime(boardingPass.boardingTime)}</p>
                </div>
              )}

              {baggage && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-800 uppercase mb-1">Baggage</p>
                  <p className="text-sm text-blue-900">
                    {baggage.baggageCount} bag(s) • {baggage.baggageWeight} kg
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Tag: {baggage.tagNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* QR Code for Mobile */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center print:hidden">
            <div className="inline-block bg-white p-4 rounded-lg border-2 border-gray-200">
              <QRCodeSVG value={boardingPass.qrCode} size={120} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Scan at gate</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card print:hidden">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center gap-2 flex-1 min-w-[150px]"
            >
              <Printer className="w-5 h-5" />
              Print Boarding Pass
            </button>
            <button
              onClick={handleDownload}
              className="btn-secondary flex items-center gap-2 flex-1 min-w-[150px]"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={handleNewCheckIn}
              className="btn-secondary flex items-center gap-2 flex-1 min-w-[150px]"
            >
              New Check-In
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="card mt-6 bg-blue-50 border-blue-200 print:hidden">
          <h3 className="font-semibold text-gray-900 mb-2">Important Information</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Please arrive at the gate at least 30 minutes before departure</li>
            <li>• Keep your boarding pass and identification ready for security checks</li>
            <li>• Your seat number is shown above - please proceed to your assigned seat</li>
            {baggage && <li>• Baggage tags have been printed - attach them to your bags</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

