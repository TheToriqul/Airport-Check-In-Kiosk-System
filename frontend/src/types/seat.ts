export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'RESERVED' | 'OCCUPIED';
export type SeatClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';

export interface Seat {
  seatId: string;
  flightId: string;
  seatNumber: string;
  seatClass: SeatClass;
  seatStatus: SeatStatus;
  bookingId?: string;
  lockedBy?: string;
  lockExpiry?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SeatMapResponse {
  seats: Seat[];
  availableCount: number;
}

export interface SeatLockRequest {
  sessionId: string;
}

export interface SeatConfirmRequest {
  bookingId: string;
  sessionId: string;
}

export interface SeatUpdateEvent {
  flightId: string;
  seatId: string;
  status: SeatStatus;
  sessionId?: string;
}
