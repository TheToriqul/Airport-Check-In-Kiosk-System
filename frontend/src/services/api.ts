import axios from 'axios';
import type { 
  BookingSearchRequest, 
  BookingSearchResponse,
  SeatMapResponse,
  SeatLockRequest,
  SeatConfirmRequest,
  BaggageCheckInRequest,
  BaggageCheckInResponse,
  BaggageCountResponse,
  BoardingPassResponse,
  SeatAssignmentsResponse,
  ApiResponse
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
    const response = await api.post<ApiResponse<BookingSearchResponse>>('/bookings/search', request);
    return response.data.data!;
  },
  
  getById: async (bookingId: string): Promise<BookingSearchResponse> => {
    const response = await api.get<ApiResponse<BookingSearchResponse>>(`/bookings/${bookingId}`);
    return response.data.data!;
  },
};

// Seat endpoints
export const seatApi = {
  getSeatMap: async (flightId: string): Promise<SeatMapResponse> => {
    const response = await api.get<ApiResponse<SeatMapResponse>>(`/flights/${flightId}/seats`);
    return response.data.data!;
  },
  
  lockSeat: async (flightId: string, seatId: string, request: SeatLockRequest): Promise<boolean> => {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
      `/flights/${flightId}/seats/${seatId}/lock`,
      request
    );
    return response.data.data?.success || false;
  },
  
  confirmSeat: async (flightId: string, seatId: string, request: SeatConfirmRequest): Promise<boolean> => {
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
    return response.data.data!;
  },
};

// Baggage endpoints
export const baggageApi = {
  checkIn: async (bookingId: string, request: BaggageCheckInRequest): Promise<BaggageCheckInResponse> => {
    const response = await api.post<ApiResponse<BaggageCheckInResponse>>(
      `/bookings/${bookingId}/baggage`,
      request
    );
    return response.data.data!;
  },
  
  getCount: async (flightId: string): Promise<BaggageCountResponse> => {
    const response = await api.get<ApiResponse<BaggageCountResponse>>(`/flights/${flightId}/baggage/count`);
    return response.data.data!;
  },
};

// Boarding pass endpoints
export const boardingPassApi = {
  generate: async (bookingId: string): Promise<BoardingPassResponse> => {
    const response = await api.post<ApiResponse<BoardingPassResponse>>(
      `/bookings/${bookingId}/boarding-pass`
    );
    return response.data.data!;
  },
  
  getPdf: async (bookingId: string): Promise<Blob> => {
    const response = await api.get(`/bookings/${bookingId}/boarding-pass/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;

