import { create } from 'zustand';
import type { Booking, Flight, Seat, BaggageRecord, BoardingPass } from '../types/index';

interface KioskState {
  // Booking data
  booking: Booking | null;
  flight: Flight | null;
  
  // Seat selection
  seats: Seat[];
  selectedSeat: Seat | null;
  sessionId: string;
  
  // Baggage
  baggage: BaggageRecord | null;
  baggageCount: number;
  
  // Boarding pass
  boardingPass: BoardingPass | null;
  
  // UI state
  currentStep: 'search' | 'seat-selection' | 'baggage' | 'boarding-pass';
  activePage: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBooking: (booking: Booking, flight: Flight) => void;
  setSeats: (seats: Seat[]) => void;
  updateSeat: (seat: Seat) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setBaggage: (baggage: BaggageRecord) => void;
  setBaggageCount: (count: number) => void;
  setBoardingPass: (boardingPass: BoardingPass) => void;
  setCurrentStep: (step: KioskState['currentStep']) => void;
  setActivePage: (page: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  generateSessionId: () => void;
}

const generateSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useKioskStore = create<KioskState>((set) => ({
  booking: null,
  flight: null,
  seats: [],
  selectedSeat: null,
  sessionId: generateSessionId(),
  baggage: null,
  baggageCount: 0,
  boardingPass: null,
  currentStep: 'search',
  activePage: null,
  isLoading: false,
  error: null,
  
  setBooking: (booking, flight) => set({ booking, flight, currentStep: 'seat-selection' }),
  
  setSeats: (seats) => set({ seats }),
  
  updateSeat: (seat) => set((state) => ({
    seats: state.seats.map((s) => s.seatId === seat.seatId ? seat : s),
  })),
  
  setSelectedSeat: (seat) => set({ selectedSeat: seat }),
  
  setBaggage: (baggage) => set({ baggage, currentStep: 'boarding-pass' }),
  
  setBaggageCount: (count) => set({ baggageCount: count }),
  
  setBoardingPass: (boardingPass) => set({ boardingPass }),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setActivePage: (page) => set({ activePage: page }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({
    booking: null,
    flight: null,
    seats: [],
    selectedSeat: null,
    sessionId: generateSessionId(),
    baggage: null,
    baggageCount: 0,
    boardingPass: null,
    currentStep: 'search',
    activePage: null,
    isLoading: false,
    error: null,
  }),
  
  generateSessionId: () => set({ sessionId: generateSessionId() }),
}));

