import axios from 'axios';
import type {
  ApiResponse,
  BaggageCheckInRequest,
  BaggageCheckInResponse,
  BaggageCountResponse,
  BoardingPassResponse,
  Booking,
  BookingSearchRequest,
  BookingSearchResponse,
  Flight,
  SeatAssignmentsResponse,
  SeatConfirmRequest,
  SeatLockRequest,
  SeatMapResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API Error]', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API Error] No response received', error.request);
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// Booking endpoints
export const bookingApi = {
  search: async (request: BookingSearchRequest): Promise<BookingSearchResponse> => {
    const response = await api.post<ApiResponse<BookingSearchResponse>>(
      '/bookings/search',
      request
    );
    if (!response.data.data) {
      throw new Error('No data received from booking search');
    }
    return response.data.data;
  },

  getById: async (bookingId: string): Promise<BookingSearchResponse> => {
    const response = await api.get<ApiResponse<BookingSearchResponse>>(`/bookings/${bookingId}`);
    if (!response.data.data) {
      throw new Error('No data received from booking lookup');
    }
    return response.data.data;
  },

  getByFlightId: async (flightId: string): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>(`/bookings/flight/${flightId}`);
    if (!response.data.data) {
      throw new Error('No booking data received');
    }
    return response.data.data;
  },
};

// Seat endpoints
export const seatApi = {
  getSeatMap: async (flightId: string): Promise<SeatMapResponse> => {
    const response = await api.get<ApiResponse<SeatMapResponse>>(`/flights/${flightId}/seats`);
    if (!response.data.data) {
      throw new Error('No seat map data received');
    }
    return response.data.data;
  },

  lockSeat: async (
    flightId: string,
    seatId: string,
    request: SeatLockRequest
  ): Promise<boolean> => {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
      `/flights/${flightId}/seats/${seatId}/lock`,
      request
    );
    return response.data.data?.success || false;
  },

  confirmSeat: async (
    flightId: string,
    seatId: string,
    request: SeatConfirmRequest
  ): Promise<boolean> => {
    const response = await api.post<ApiResponse<{ success: boolean; seat: unknown }>>(
      `/flights/${flightId}/seats/${seatId}/confirm`,
      request
    );
    return response.data.data?.success || false;
  },

  unlockSeat: async (flightId: string, seatId: string, sessionId: string): Promise<boolean> => {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(
      `/flights/${flightId}/seats/${seatId}/unlock?sessionId=${encodeURIComponent(sessionId)}`
    );
    return response.data.data?.success || false;
  },

  getSeatAssignments: async (flightId: string): Promise<SeatAssignmentsResponse> => {
    const response = await api.get<ApiResponse<SeatAssignmentsResponse>>(
      `/flights/${flightId}/seats/assignments`
    );
    if (!response.data.data) {
      throw new Error('No seat assignments data received');
    }
    return response.data.data;
  },
};

// Baggage endpoints
export const baggageApi = {
  checkIn: async (
    bookingId: string,
    request: BaggageCheckInRequest
  ): Promise<BaggageCheckInResponse> => {
    const response = await api.post<ApiResponse<BaggageCheckInResponse>>(
      `/bookings/${bookingId}/baggage`,
      request
    );
    if (!response.data.data) {
      throw new Error('No baggage check-in data received');
    }
    return response.data.data;
  },

  getCount: async (flightId: string): Promise<BaggageCountResponse> => {
    const response = await api.get<ApiResponse<BaggageCountResponse>>(
      `/flights/${flightId}/baggage/count`
    );
    if (!response.data.data) {
      throw new Error('No baggage count data received');
    }
    return response.data.data;
  },

  getDebug: async (flightId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/flights/${flightId}/baggage/debug`);
    if (!response.data.data) {
      throw new Error('No baggage debug data received');
    }
    return response.data.data;
  },
};

// Boarding pass endpoints
export const boardingPassApi = {
  generate: async (bookingId: string): Promise<BoardingPassResponse> => {
    const response = await api.post<ApiResponse<BoardingPassResponse>>(
      `/bookings/${bookingId}/boarding-pass`
    );
    if (!response.data.data) {
      throw new Error('No boarding pass data received');
    }
    return response.data.data;
  },

  getPdf: async (bookingId: string): Promise<Blob> => {
    const response = await api.get(`/bookings/${bookingId}/boarding-pass/pdf`, {
      responseType: 'blob',
    });
    if (!response.data) {
      throw new Error('No PDF data received');
    }
    return response.data;
  },
};

// Flight endpoints
export const flightApi = {
  getAll: async (): Promise<Flight[]> => {
    const response = await api.get<ApiResponse<Flight[]>>('/flights');
    if (!response.data.data) {
      throw new Error('No flight data received');
    }
    return response.data.data;
  },

  getById: async (flightId: string): Promise<Flight> => {
    const response = await api.get<ApiResponse<Flight>>(`/flights/${flightId}`);
    if (!response.data.data) {
      throw new Error('No flight data received');
    }
    return response.data.data;
  },
};

export default api;
