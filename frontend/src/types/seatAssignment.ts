export interface SeatAssignment {
  seatId: string;
  seatNumber: string;
  seatClass: string;
  seatStatus: string;
  bookingId: string;
  passengerName: string;
  passportNumber?: string;
  email?: string;
  phone?: string;
  flightId: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
}

export interface SeatAssignmentsResponse {
  assignments: SeatAssignment[];
  count: number;
}

