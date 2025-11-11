package com.airport.kiosk.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airport.kiosk.dto.ApiResponse;
import com.airport.kiosk.dto.BaggageCheckInRequest;
import com.airport.kiosk.model.BaggageRecord;
import com.airport.kiosk.repository.BookingRepository;
import com.airport.kiosk.service.BaggageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BaggageController {
    
    private final BaggageService baggageService;
    private final BookingRepository bookingRepository;
    
    @PostMapping("/bookings/{bookingId}/baggage")
    public ResponseEntity<ApiResponse<Object>> checkInBaggage(
            @PathVariable String bookingId,
            @RequestBody BaggageCheckInRequest request) {
        try {
            // Get booking and flight ID (case-insensitive lookup)
            com.airport.kiosk.model.Booking booking = bookingRepository.findByBookingIdIgnoreCase(bookingId != null ? bookingId.trim() : "")
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
            String normalizedBookingId = booking.getBookingId();
            String flightId = booking.getFlightId();
            
            BaggageRecord baggage = baggageService.checkInBaggage(
                normalizedBookingId,
                flightId,
                request.getWeight(),
                request.getCount()
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("baggage", baggage);
            result.put("tagNumber", baggage.getTagNumber());
            
            return ResponseEntity.ok(ApiResponse.success(result, "Baggage checked in successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "BAGGAGE_ERROR"));
        }
    }
    
    @GetMapping("/flights/{flightId}/baggage/count")
    public ResponseEntity<ApiResponse<Object>> getBaggageCount(@PathVariable String flightId) {
        try {
            Long count = baggageService.getBaggageCount(flightId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("count", count);
            
            return ResponseEntity.ok(ApiResponse.success(result, "Baggage count retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "BAGGAGE_COUNT_ERROR"));
        }
    }
}
