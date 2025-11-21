package com.airport.kiosk.service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.airport.kiosk.exception.BookingNotFoundException;
import com.airport.kiosk.exception.FlightNotFoundException;
import com.airport.kiosk.exception.SeatNotFoundException;
import com.airport.kiosk.model.Booking;
import com.airport.kiosk.model.Flight;
import com.airport.kiosk.model.Seat;
import com.airport.kiosk.repository.BookingRepository;
import com.airport.kiosk.repository.FlightRepository;
import com.airport.kiosk.repository.SeatRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardingPassService {
    
    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    
    /**
     * Generate boarding pass data (case-insensitive booking lookup)
     */
    public Map<String, Object> generateBoardingPass(String bookingId) {
        Booking booking = bookingRepository.findByBookingIdIgnoreCase(bookingId != null ? bookingId.trim() : "")
            .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));
        
        Flight flight = flightRepository.findByFlightId(booking.getFlightId())
            .orElseThrow(() -> new FlightNotFoundException("Flight not found: " + booking.getFlightId()));
        
        // Find seat for this booking (case-insensitive comparison)
        String normalizedBookingId = booking.getBookingId();
        Seat seat = seatRepository.findByFlightId(flight.getFlightId()).stream()
            .filter(s -> s.getBookingId() != null && s.getBookingId().equalsIgnoreCase(normalizedBookingId))
            .findFirst()
            .orElseThrow(() -> new SeatNotFoundException("Seat not found for booking: " + bookingId));
        
        // Generate boarding pass data
        Map<String, Object> boardingPass = new HashMap<>();
        boardingPass.put("bookingId", booking.getBookingId());
        boardingPass.put("passengerName", booking.getPassengerName());
        boardingPass.put("flightNumber", flight.getFlightNumber());
        boardingPass.put("seatNumber", seat.getSeatNumber());
        boardingPass.put("departureAirport", flight.getDepartureAirport());
        boardingPass.put("arrivalAirport", flight.getArrivalAirport());
        boardingPass.put("departureTime", flight.getDepartureTime().format(DateTimeFormatter.ISO_DATE_TIME));
        boardingPass.put("arrivalTime", flight.getArrivalTime().format(DateTimeFormatter.ISO_DATE_TIME));
        boardingPass.put("gate", "TBD"); // Gate assignment would come from another service
        boardingPass.put("boardingTime", flight.getDepartureTime().minusMinutes(30).format(DateTimeFormatter.ISO_DATE_TIME));
        boardingPass.put("qrCode", generateQRCode(bookingId, flight.getFlightNumber(), seat.getSeatNumber()));
        
        Map<String, Object> result = new HashMap<>();
        result.put("boardingPass", boardingPass);
        result.put("pdfUrl", "/api/bookings/" + bookingId + "/boarding-pass/pdf");
        
        return result;
    }
    
    /**
     * Generate QR code data for boarding pass
     */
    private String generateQRCode(String bookingId, String flightNumber, String seatNumber) {
        // Generate a simple QR code string (in production, use a QR code library)
        return bookingId + "|" + flightNumber + "|" + seatNumber + "|" + UUID.randomUUID().toString();
    }
}

