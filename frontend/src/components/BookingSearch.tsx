import { Check, Copy, CreditCard, HelpCircle, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/image/logo.png';
import { bookingApi } from '../services/api';
import { useKioskStore } from '../store/kioskStore';
import type { Booking, BookingSearchRequest } from '../types';

// Sample booking references
const SAMPLE_BOOKING_REFERENCES = [
  'BK001',
  'BK002',
  'BK003',
  'BK004',
  'BK005',
  'BK006',
  'BK007',
  'BK008',
];

export default function BookingSearch() {
  const [searchType, setSearchType] = useState<'reference' | 'passport'>('reference');
  const [searchValue, setSearchValue] = useState('');
  const [samplePassports, setSamplePassports] = useState<string[]>([]);
  const [loadingPassports, setLoadingPassports] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { setBooking, setLoading, setError, isLoading } = useKioskStore();

  // Fetch sample passport numbers when passport search is active
  useEffect(() => {
    if (searchType === 'passport' && samplePassports.length === 0) {
      fetchSamplePassports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchType]);

  const fetchSamplePassports = async () => {
    setLoadingPassports(true);
    try {
      const passports: string[] = [];

      // Fetch bookings from all flights to get all passport numbers
      // Try FL001-FL004 to cover all bookings
      const flights = ['FL001', 'FL002', 'FL003', 'FL004'];

      for (const flightId of flights) {
        try {
          const bookings = await bookingApi.getByFlightId(flightId);
          const flightPassports = bookings
            .map((b: Booking) => b.passportNumber)
            .filter((p): p is string => p !== null && p !== undefined);
          passports.push(...flightPassports);
        } catch (e) {
          // Continue with next flight if one fails
          console.warn(`Failed to fetch bookings for ${flightId}:`, e);
        }
      }

      // Remove duplicates and limit to 8 samples
      const uniquePassports = Array.from(new Set(passports));

      // If we have less than 8, use fallback to ensure we always show 8
      if (uniquePassports.length < 8) {
        const fallback = [
          'P12345678',
          'P87654321',
          'P11223344',
          'P45678901',
          'P56789012',
          'P67890123',
          'P78901234',
          'P89012345',
        ];
        // Merge API results with fallback, removing duplicates
        const allPassports = Array.from(new Set([...uniquePassports, ...fallback]));
        setSamplePassports(allPassports.slice(0, 8));
      } else {
        setSamplePassports(uniquePassports.slice(0, 8));
      }
    } catch (error) {
      console.error('Failed to fetch sample passports:', error);
      // Fallback to hardcoded samples if API fails
      setSamplePassports([
        'P12345678',
        'P87654321',
        'P11223344',
        'P45678901',
        'P56789012',
        'P67890123',
        'P78901234',
        'P89012345',
      ]);
    } finally {
      setLoadingPassports(false);
    }
  };

  const handleCopy = (value: string, index: number) => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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

  const sampleData = searchType === 'reference' ? SAMPLE_BOOKING_REFERENCES : samplePassports;

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

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[8fr_2fr] gap-6 animate-slide-up relative z-10">
        {/* Left Column: Main Search Form */}
        <div className="card">
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
              className="text-3xl font-extrabold gradient-text mb-3 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              Airport Check-In Kiosk
            </h1>
            <p
              className="text-gray-600 text-base font-medium animate-slide-up"
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
                className="input-field pl-14 text-base font-medium"
                disabled={isLoading}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchValue.trim()}
              className="btn-primary w-full text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
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
        </div>

        {/* Right Column: Helper Panel */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Sample {searchType === 'reference' ? 'References' : 'Passports'}
              </h2>
              <p className="text-xs text-gray-600">Click to copy</p>
            </div>
          </div>

          {searchType === 'passport' && loadingPassports ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : sampleData.length > 0 ? (
            <div className="space-y-1.5">
              {sampleData.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    handleCopy(item, index);
                    setSearchValue(item);
                  }}
                  className="w-full p-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary-50 hover:to-primary-100 rounded-lg border border-gray-200 hover:border-primary-300 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm group-hover:shadow transition-shadow flex-shrink-0">
                      {searchType === 'reference' ? (
                        <CreditCard className="w-3 h-3 text-primary-600" />
                      ) : (
                        <User className="w-3 h-3 text-primary-600" />
                      )}
                    </div>
                    <span className="font-mono text-xs font-semibold text-gray-900 group-hover:text-primary-700 truncate">
                      {item}
                    </span>
                  </div>
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-xs">No sample data available</p>
            </div>
          )}

          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 leading-relaxed">
              {searchType === 'reference' ? (
                <>Find your booking reference on your confirmation email or ticket.</>
              ) : (
                <>Sample passport numbers from the system. Click to copy and use.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
