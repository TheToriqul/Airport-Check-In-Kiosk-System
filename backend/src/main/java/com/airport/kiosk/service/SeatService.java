package com.airport.kiosk.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airport.kiosk.exception.SeatNotFoundException;
import com.airport.kiosk.model.Seat;
import com.airport.kiosk.repository.BookingRepository;
import com.airport.kiosk.repository.FlightRepository;
import com.airport.kiosk.repository.SeatRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeatService {
    
    private final SeatRepository seatRepository;
    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    private static final long LOCK_TTL_SECONDS = 30; // 30 seconds TTL
    
    /**
     * Lock a seat with TTL. Thread-safe operation using synchronized block.
     */
    @Transactional
    public synchronized boolean lockSeat(String flightId, String seatId, String sessionId) {
        // Clean expired locks first
        cleanExpiredLocks(flightId);
        
        Seat seat = seatRepository.findByFlightIdAndSeatId(flightId, seatId)
            .orElseThrow(() -> new SeatNotFoundException("Seat not found: " + seatId));
        
        // Atomic check and lock
        if (seat.getSeatStatus() == Seat.SeatStatus.AVAILABLE && 
            (seat.getLockExpiry() == null || seat.getLockExpiry().isBefore(LocalDateTime.now()))) {
            
            seat.setSeatStatus(Seat.SeatStatus.LOCKED);
            seat.setLockedBy(sessionId);
            seat.setLockExpiry(LocalDateTime.now().plusSeconds(LOCK_TTL_SECONDS));
            seatRepository.save(seat);
            
            // Broadcast lock event to all clients
            Map<String, Object> event = new HashMap<>();
            event.put("flightId", flightId);
            event.put("seatId", seatId);
            event.put("status", "LOCKED");
            event.put("sessionId", sessionId);
            
            messagingTemplate.convertAndSend("/topic/flights/" + flightId + "/seats", event);
            
            return true;
        }
        return false; // Seat already locked or unavailable
    }
    
    /**
     * Confirm seat selection within transaction
     * If booking already has a reserved seat, it will be released first (replaced)
     */
    @Transactional
    public synchronized boolean confirmSeat(String flightId, String seatId, String bookingId, String sessionId) {
        Seat seat = seatRepository.findByFlightIdAndSeatId(flightId, seatId)
            .orElseThrow(() -> new SeatNotFoundException("Seat not found: " + seatId));
        
        // Verify lock ownership
        if (seat.getSeatStatus() == Seat.SeatStatus.LOCKED && 
            sessionId.equals(seat.getLockedBy())) {
            
            // Check if booking already has a reserved seat for this flight (case-insensitive)
            // Normalize bookingId to ensure consistent comparison
            String normalizedBookingId = bookingId != null ? bookingId.trim().toUpperCase() : null;
            
            // Find ALL reserved seats for this booking (case-insensitive query)
            List<Seat> existingSeats = new ArrayList<>(seatRepository.findByFlightIdAndBookingIdAndReserved(flightId, normalizedBookingId));
            
            // Also check all seats for this flight and manually filter by bookingId (case-insensitive)
            // This ensures we catch any seats that might have been saved with different case
            if (normalizedBookingId != null) {
                List<Seat> allReservedSeats = seatRepository.findByFlightId(flightId).stream()
                    .filter(s -> s.getSeatStatus() == Seat.SeatStatus.RESERVED 
                        && s.getBookingId() != null 
                        && s.getBookingId().trim().toUpperCase().equals(normalizedBookingId))
                    .toList();
                
                // Merge with existing seats, avoiding duplicates
                for (Seat reservedSeat : allReservedSeats) {
                    if (!existingSeats.stream().anyMatch(s -> s.getSeatId().equals(reservedSeat.getSeatId()))) {
                        existingSeats.add(reservedSeat);
                    }
                }
            }
            
            // Release any existing reserved seats for this booking
            for (Seat existingSeat : existingSeats) {
                // Skip if it's the same seat we're about to confirm
                if (!existingSeat.getSeatId().equals(seatId)) {
                    existingSeat.setSeatStatus(Seat.SeatStatus.AVAILABLE);
                    existingSeat.setBookingId(null);
                    existingSeat.setLockedBy(null);
                    existingSeat.setLockExpiry(null);
                    seatRepository.save(existingSeat);
                    
                    // Increment available seats count for released seat
                    flightRepository.incrementAvailableSeats(flightId);
                    
                    // Broadcast release event for old seat
                    Map<String, Object> releaseEvent = new HashMap<>();
                    releaseEvent.put("flightId", flightId);
                    releaseEvent.put("seatId", existingSeat.getSeatId());
                    releaseEvent.put("status", "AVAILABLE");
                    releaseEvent.put("sessionId", null);
                    
                    messagingTemplate.convertAndSend("/topic/flights/" + flightId + "/seats", releaseEvent);
                }
            }
            
            // Confirm the new seat (use normalized bookingId for consistency)
            seat.setSeatStatus(Seat.SeatStatus.RESERVED);
            seat.setBookingId(normalizedBookingId);
            seat.setLockedBy(null);
            seat.setLockExpiry(null);
            seatRepository.save(seat);
            
            // Update flight available seats count (decrement for new reservation)
            flightRepository.decrementAvailableSeats(flightId);
            
            // Broadcast reservation event for new seat
            Map<String, Object> event = new HashMap<>();
            event.put("flightId", flightId);
            event.put("seatId", seatId);
            event.put("status", "RESERVED");
            event.put("sessionId", null);
            
            messagingTemplate.convertAndSend("/topic/flights/" + flightId + "/seats", event);
            
            return true;
        }
        return false;
    }
    
    /**
     * Unlock a seat (release lock)
     */
    @Transactional
    public synchronized boolean unlockSeat(String flightId, String seatId, String sessionId) {
        Seat seat = seatRepository.findByFlightIdAndSeatId(flightId, seatId)
            .orElseThrow(() -> new SeatNotFoundException("Seat not found: " + seatId));
        
        // Only unlock if locked by this session
        if (seat.getSeatStatus() == Seat.SeatStatus.LOCKED && 
            sessionId.equals(seat.getLockedBy())) {
            
            seat.setSeatStatus(Seat.SeatStatus.AVAILABLE);
            seat.setLockedBy(null);
            seat.setLockExpiry(null);
            seatRepository.save(seat);
            
            // Broadcast unlock event
            Map<String, Object> event = new HashMap<>();
            event.put("flightId", flightId);
            event.put("seatId", seatId);
            event.put("status", "AVAILABLE");
            event.put("sessionId", null);
            
            messagingTemplate.convertAndSend("/topic/flights/" + flightId + "/seats", event);
            
            return true;
        }
        return false;
    }
    
    /**
     * Get seat map for a flight
     */
    public List<Seat> getSeatMap(String flightId) {
        return seatRepository.findByFlightId(flightId);
    }
    
    /**
     * Get all reserved seats with passenger and flight information
     */
    public List<com.airport.kiosk.dto.SeatAssignmentResponse> getSeatAssignments(String flightId) {
        List<Seat> reservedSeats = seatRepository.findByFlightId(flightId).stream()
            .filter(s -> s.getSeatStatus() == Seat.SeatStatus.RESERVED && s.getBookingId() != null)
            .toList();
        
        List<com.airport.kiosk.dto.SeatAssignmentResponse> assignments = new ArrayList<>();
        
        for (Seat seat : reservedSeats) {
            com.airport.kiosk.dto.SeatAssignmentResponse assignment = new com.airport.kiosk.dto.SeatAssignmentResponse();
            assignment.setSeatId(seat.getSeatId());
            assignment.setSeatNumber(seat.getSeatNumber());
            assignment.setSeatClass(seat.getSeatClass().name());
            assignment.setSeatStatus(seat.getSeatStatus().name());
            assignment.setBookingId(seat.getBookingId());
            assignment.setFlightId(seat.getFlightId());
            
            // Get booking information
            com.airport.kiosk.model.Booking booking = bookingRepository.findByBookingIdIgnoreCase(seat.getBookingId())
                .orElse(null);
            if (booking != null) {
                assignment.setPassengerName(booking.getPassengerName());
                assignment.setPassportNumber(booking.getPassportNumber());
                assignment.setEmail(booking.getEmail());
                assignment.setPhone(booking.getPhone());
            }
            
            // Get flight information
            com.airport.kiosk.model.Flight flight = flightRepository.findByFlightId(seat.getFlightId())
                .orElse(null);
            if (flight != null) {
                assignment.setFlightNumber(flight.getFlightNumber());
                assignment.setDepartureAirport(flight.getDepartureAirport());
                assignment.setArrivalAirport(flight.getArrivalAirport());
                assignment.setDepartureTime(flight.getDepartureTime().toString());
                assignment.setArrivalTime(flight.getArrivalTime().toString());
            }
            
            assignments.add(assignment);
        }
        
        return assignments;
    }
    
    /**
     * Clean expired locks - scheduled task
     */
    @Scheduled(fixedRate = 10000) // Run every 10 seconds
    @Transactional
    public void cleanExpiredLocksScheduled() {
        // This will be called for all flights, but we can optimize by tracking active flights
        // For now, we'll clean locks when they're accessed
    }
    
    /**
     * Clean expired locks for a specific flight
     */
    private void cleanExpiredLocks(String flightId) {
        LocalDateTime now = LocalDateTime.now();
        List<Seat> expiredLocks = seatRepository.findExpiredLocks(flightId, now);
        
        for (Seat seat : expiredLocks) {
            seat.setSeatStatus(Seat.SeatStatus.AVAILABLE);
            seat.setLockedBy(null);
            seat.setLockExpiry(null);
            seatRepository.save(seat);
            
            // Broadcast unlock event
            Map<String, Object> event = new HashMap<>();
            event.put("flightId", flightId);
            event.put("seatId", seat.getSeatId());
            event.put("status", "AVAILABLE");
            event.put("sessionId", null);
            
            messagingTemplate.convertAndSend("/topic/flights/" + flightId + "/seats", event);
        }
    }
}

