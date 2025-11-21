export interface Flight {
  flightId: string;
  flightNumber: string;
  airlineName?: string;
  aircraftType?: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  baggageCount: number;
  flightStatus: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}
