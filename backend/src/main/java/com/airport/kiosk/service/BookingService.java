package com.airport.kiosk.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.airport.kiosk.exception.BookingNotFoundException;
import com.airport.kiosk.model.Booking;
import com.airport.kiosk.model.Flight;
import com.airport.kiosk.repository.BookingRepository;
import com.airport.kiosk.repository.FlightRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    
    /**
     * Search booking by reference or passport number (case-insensitive)
     */
    public Map<String, Object> searchBooking(String bookingReference, String passportNumber) {
        Booking booking;
        
        if (bookingReference != null && !bookingReference.trim().isEmpty()) {
            booking = bookingRepository.findByBookingIdIgnoreCase(bookingReference.trim())
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingReference));
        } else if (passportNumber != null && !passportNumber.trim().isEmpty()) {
            booking = bookingRepository.findByPassportNumberIgnoreCase(passportNumber.trim())
                .orElseThrow(() -> new BookingNotFoundException("Booking not found for passport: " + passportNumber));
        } else {
            throw new IllegalArgumentException("Either booking reference or passport number must be provided");
        }
        
        // Get flight details
        Flight flight = flightRepository.findByFlightId(booking.getFlightId())
            .orElseThrow(() -> new RuntimeException("Flight not found: " + booking.getFlightId()));
        
        Map<String, Object> result = new HashMap<>();
        result.put("booking", booking);
        result.put("flight", flight);
        
        return result;
    }
    
    /**
     * Get booking by ID (case-insensitive)
     */
    public Booking getBookingById(String bookingId) {
        return bookingRepository.findByBookingIdIgnoreCase(bookingId != null ? bookingId.trim() : "")
            .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));
    }
    
    /**
     * Get flight by booking ID
     */
    public Flight getFlightByBookingId(String bookingId) {
        Booking booking = getBookingById(bookingId);
        return flightRepository.findByFlightId(booking.getFlightId())
            .orElseThrow(() -> new RuntimeException("Flight not found: " + booking.getFlightId()));
    }
}

