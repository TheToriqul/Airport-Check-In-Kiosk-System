import { CreditCard, Search, User } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/image/logo.png';
import { bookingApi } from '../services/api';
import { useKioskStore } from '../store/kioskStore';
import type { BookingSearchRequest } from '../types';

export default function BookingSearch() {
  const [searchType, setSearchType] = useState<'reference' | 'passport'>('reference');
  const [searchValue, setSearchValue] = useState('');
  const { setBooking, setLoading, setError, isLoading } = useKioskStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Normalize input: trim whitespace, uppercase booking references, preserve passport case
      const normalizedValue = searchValue.trim();
      const request: BookingSearchRequest =
        searchType === 'reference'
          ? { bookingReference: normalizedValue.toUpperCase() }
          : { passportNumber: normalizedValue };

      const response = await bookingApi.search(request);
      setBooking(response.booking, response.flight);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to search booking';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 animate-fade-in relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="card max-w-2xl w-full animate-slide-up relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6 animate-slide-down">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-200/50 rounded-full blur-xl animate-pulse-slow"></div>
              <img
                src={logo}
                alt="Airport Check-In Kiosk Logo"
                className="h-28 w-auto object-contain relative z-10 drop-shadow-lg"
              />
            </div>
          </div>
          <h1
            className="text-5xl font-extrabold gradient-text mb-3 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            Airport Check-In Kiosk
          </h1>
          <p
            className="text-gray-600 text-xl font-medium animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            Find your booking to begin check-in
          </p>
        </div>

        {/* Search Type Toggle */}
        <div className="flex gap-3 mb-8 bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => setSearchType('reference')}
            className={`flex-1 py-4 px-5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              searchType === 'reference'
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <CreditCard className={`w-5 h-5 ${searchType === 'reference' ? 'text-white' : ''}`} />
            Booking Reference
          </button>
          <button
            type="button"
            onClick={() => setSearchType('passport')}
            className={`flex-1 py-4 px-5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              searchType === 'passport'
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <User className={`w-5 h-5 ${searchType === 'passport' ? 'text-white' : ''}`} />
            Passport Number
          </button>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="space-y-6 animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <Search
                className={`h-6 w-6 transition-colors duration-300 ${
                  searchValue ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-400'
                }`}
              />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                searchType === 'reference'
                  ? 'Enter your booking reference (e.g., BK001)'
                  : 'Enter your passport number'
              }
              className="input-field pl-14 text-lg font-medium"
              disabled={isLoading}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !searchValue.trim()}
            className="btn-primary w-full text-lg py-5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          >
            {isLoading ? (
              <span className="flex items-center justify-center relative z-10">
                <svg
                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                <span className="font-semibold">Searching...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 relative z-10">
                <Search className="w-5 h-5" />
                <span className="font-semibold">Search Booking</span>
              </span>
            )}
            {!isLoading && (
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            )}
          </button>
        </form>

        {/* Help Text */}
        <div
          className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200/50 shadow-md animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Need help?</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                You can find your booking reference on your confirmation email or ticket.
                Alternatively, scan your passport at the kiosk scanner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
