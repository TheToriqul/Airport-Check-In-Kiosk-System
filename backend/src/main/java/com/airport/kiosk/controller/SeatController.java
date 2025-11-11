package com.airport.kiosk.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.airport.kiosk.dto.ApiResponse;
import com.airport.kiosk.dto.SeatConfirmRequest;
import com.airport.kiosk.dto.SeatLockRequest;
import com.airport.kiosk.model.Seat;
import com.airport.kiosk.repository.BookingRepository;
import com.airport.kiosk.repository.SeatRepository;
import com.airport.kiosk.service.SeatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/flights/{flightId}/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatController {
    
    private final SeatService seatService;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getSeatMap(@PathVariable String flightId) {
        try {
            List<Seat> seats = seatService.getSeatMap(flightId);
            Long availableCount = seatRepository.countAvailableSeatsByFlightId(flightId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("seats", seats);
            result.put("availableCount", availableCount);
            
            return ResponseEntity.ok(ApiResponse.success(result, "Seat map retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "SEAT_MAP_ERROR"));
        }
    }
    
    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<Object>> getSeatAssignments(@PathVariable String flightId) {
        try {
            List<com.airport.kiosk.dto.SeatAssignmentResponse> assignments = seatService.getSeatAssignments(flightId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("assignments", assignments);
            result.put("count", assignments.size());
            
            return ResponseEntity.ok(ApiResponse.success(result, "Seat assignments retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "SEAT_ASSIGNMENTS_ERROR"));
        }
    }
    
    @PostMapping("/{seatId}/lock")
    public ResponseEntity<ApiResponse<Object>> lockSeat(
            @PathVariable String flightId,
            @PathVariable String seatId,
            @RequestBody SeatLockRequest request) {
        try {
            boolean success = seatService.lockSeat(flightId, seatId, request.getSessionId());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            result.put("message", success ? "Seat locked successfully" : "Seat is not available");
            
            return ResponseEntity.ok(ApiResponse.success(result, success ? "Seat locked" : "Seat unavailable"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "LOCK_ERROR"));
        }
    }
    
    @PostMapping("/{seatId}/confirm")
    public ResponseEntity<ApiResponse<Object>> confirmSeat(
            @PathVariable String flightId,
            @PathVariable String seatId,
            @RequestBody SeatConfirmRequest request) {
        try {
            // Normalize booking ID (case-insensitive lookup and ensure uppercase for consistency)
            String normalizedBookingId = request.getBookingId();
            if (normalizedBookingId != null && !normalizedBookingId.trim().isEmpty()) {
                normalizedBookingId = bookingRepository.findByBookingIdIgnoreCase(normalizedBookingId.trim())
                    .map(booking -> booking.getBookingId().toUpperCase()) // Ensure uppercase for consistency
                    .orElse(normalizedBookingId.trim().toUpperCase());
            }
            
            boolean success = seatService.confirmSeat(
                flightId, 
                seatId, 
                normalizedBookingId, 
                request.getSessionId()
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            if (success) {
                Seat seat = seatRepository.findByFlightIdAndSeatId(flightId, seatId).orElse(null);
                result.put("seat", seat);
            }
            
            return ResponseEntity.ok(ApiResponse.success(result, 
                success ? "Seat confirmed successfully" : "Failed to confirm seat"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "CONFIRM_ERROR"));
        }
    }
    
    @DeleteMapping("/{seatId}/unlock")
    public ResponseEntity<ApiResponse<Object>> unlockSeat(
            @PathVariable String flightId,
            @PathVariable String seatId,
            @RequestParam String sessionId) {
        try {
            boolean success = seatService.unlockSeat(flightId, seatId, sessionId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            
            return ResponseEntity.ok(ApiResponse.success(result, 
                success ? "Seat unlocked successfully" : "Failed to unlock seat"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "UNLOCK_ERROR"));
        }
    }
}

