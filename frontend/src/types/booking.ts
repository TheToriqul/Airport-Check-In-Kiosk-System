import type { Flight } from './flight';

export interface Booking {
  bookingId: string;
  passengerName: string;
  passportNumber?: string;
  email?: string;
  phone?: string;
  flightId: string;
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface BookingSearchRequest {
  bookingReference?: string;
  passportNumber?: string;
}

export interface BookingSearchResponse {
  booking: Booking;
  flight: Flight;
}
