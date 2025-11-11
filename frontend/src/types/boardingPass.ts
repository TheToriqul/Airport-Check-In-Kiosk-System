export interface BoardingPass {
  bookingId: string;
  passengerName: string;
  flightNumber: string;
  seatNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  gate?: string;
  boardingTime?: string;
  qrCode: string;
}

export interface BoardingPassResponse {
  boardingPass: BoardingPass;
  pdfUrl: string;
}
