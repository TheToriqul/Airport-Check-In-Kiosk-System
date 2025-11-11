export interface BaggageRecord {
  baggageId: string;
  bookingId: string;
  flightId: string;
  baggageWeight: number;
  baggageCount: number;
  tagNumber: string;
  checkInTime: string;
}

export interface BaggageCheckInRequest {
  weight: number;
  count: number;
}

export interface BaggageCheckInResponse {
  baggage: BaggageRecord;
  tagNumber: string;
}

export interface BaggageCountResponse {
  count: number;
}

export interface BaggageUpdateEvent {
  flightId: string;
  count: number;
}
