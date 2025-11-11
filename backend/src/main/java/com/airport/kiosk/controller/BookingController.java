package com.airport.kiosk.controller;

import com.airport.kiosk.dto.ApiResponse;
import com.airport.kiosk.dto.BookingSearchRequest;
import com.airport.kiosk.model.Booking;
import com.airport.kiosk.model.Flight;
import com.airport.kiosk.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {
    
    private final BookingService bookingService;
    
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Object>> searchBooking(@RequestBody BookingSearchRequest request) {
        try {
            Object result = bookingService.searchBooking(
                request.getBookingReference(), 
                request.getPassportNumber()
            );
            return ResponseEntity.ok(ApiResponse.success(result, "Booking found successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "BOOKING_NOT_FOUND"));
        }
    }
    
    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<Object>> getBooking(@PathVariable String bookingId) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);
            Flight flight = bookingService.getFlightByBookingId(bookingId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("booking", booking);
            result.put("flight", flight);
            
            return ResponseEntity.ok(ApiResponse.success(result, "Booking retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "BOOKING_NOT_FOUND"));
        }
    }
}

