package com.airport.kiosk.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.airport.kiosk.exception.FlightNotFoundException;
import com.airport.kiosk.model.BaggageRecord;
import com.airport.kiosk.model.Flight;
import com.airport.kiosk.repository.BaggageRepository;
import com.airport.kiosk.repository.FlightRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BaggageService {
    
    private final FlightRepository flightRepository;
    private final BaggageRepository baggageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Check in baggage for a passenger (passenger-wise: replaces old count if exists)
     * Uses synchronized method and REPEATABLE_READ isolation level
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public synchronized BaggageRecord checkInBaggage(String bookingId, String flightId, 
                                                      BigDecimal weight, Integer count) {
        // Verify flight exists
        Flight flight = flightRepository.findByFlightId(flightId)
            .orElseThrow(() -> new FlightNotFoundException("Flight not found: " + flightId));
        
        // Check if passenger already has a baggage record
        // IMPORTANT: Only ONE record per booking_id is allowed
        java.util.List<BaggageRecord> existingRecords = baggageRepository.findByBookingId(bookingId);
        BaggageRecord baggage;
        Integer oldCount = 0;
        
        if (!existingRecords.isEmpty()) {
            // Passenger has existing baggage record - update it (passenger-wise)
            baggage = existingRecords.get(0); // Use the first record (should only be one per booking)
            oldCount = baggage.getBaggageCount();
            
            // If there are duplicate records (shouldn't happen, but handle it)
            if (existingRecords.size() > 1) {
                // Delete duplicate records and subtract their counts from flight total
                for (int i = 1; i < existingRecords.size(); i++) {
                    BaggageRecord duplicate = existingRecords.get(i);
                    Integer duplicateCount = duplicate.getBaggageCount();
                    if (duplicateCount > 0) {
                        flightRepository.decrementBaggageCount(flightId, duplicateCount);
                    }
                    baggageRepository.delete(duplicate);
                }
            }
            
            // Subtract old count from flight total
            if (oldCount > 0) {
                flightRepository.decrementBaggageCount(flightId, oldCount);
            }
            
            // Update existing record
            baggage.setBaggageWeight(weight);
            baggage.setBaggageCount(count);
            baggage.setCheckInTime(LocalDateTime.now());
            // Keep existing tagNumber and baggageId
        } else {
            // New passenger - create new record
            baggage = new BaggageRecord();
            baggage.setBaggageId(UUID.randomUUID().toString());
            baggage.setBookingId(bookingId);
            baggage.setFlightId(flightId);
            baggage.setBaggageWeight(weight);
            baggage.setBaggageCount(count);
            baggage.setTagNumber(generateTagNumber(flightId));
            baggage.setCheckInTime(LocalDateTime.now());
        }
        
        // Add new count to flight total
        flightRepository.incrementBaggageCount(flightId, count);
        
        // Save/update baggage record
        baggageRepository.save(baggage);
        
        // Refresh entity to get updated count
        flight = flightRepository.findByFlightId(flightId)
            .orElseThrow(() -> new FlightNotFoundException("Flight not found: " + flightId));
        
        // Broadcast baggage count update
        Map<String, Object> event = new HashMap<>();
        event.put("flightId", flightId);
        event.put("count", flight.getBaggageCount());
        
        messagingTemplate.convertAndSend("/topic/flights/" + flightId + "/baggage", event);
        
        return baggage;
    }
    
    /**
     * Get baggage count for a flight (total number of bags, not records)
     */
    public Long getBaggageCount(String flightId) {
        Flight flight = flightRepository.findByFlightId(flightId)
            .orElseThrow(() -> new FlightNotFoundException("Flight not found: " + flightId));
        return flight.getBaggageCount() != null ? flight.getBaggageCount().longValue() : 0L;
    }
    
    /**
     * Debug method to inspect baggage records and flight count
     */
    public org.springframework.http.ResponseEntity<com.airport.kiosk.dto.ApiResponse<Object>> getBaggageDebug(String flightId) {
        Flight flight = flightRepository.findByFlightId(flightId)
            .orElseThrow(() -> new FlightNotFoundException("Flight not found: " + flightId));
        
        java.util.List<BaggageRecord> records = baggageRepository.findByFlightId(flightId);
        
        // Calculate sum of baggage_count from records
        Integer sumFromRecords = records.stream()
            .mapToInt(BaggageRecord::getBaggageCount)
            .sum();
        
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("flightId", flightId);
        debugInfo.put("flightBaggageCount", flight.getBaggageCount());
        debugInfo.put("sumFromRecords", sumFromRecords);
        debugInfo.put("recordCount", records.size());
        debugInfo.put("records", records.stream().map(r -> {
            Map<String, Object> recordInfo = new HashMap<>();
            recordInfo.put("baggageId", r.getBaggageId());
            recordInfo.put("bookingId", r.getBookingId());
            recordInfo.put("baggageCount", r.getBaggageCount());
            recordInfo.put("weight", r.getBaggageWeight());
            recordInfo.put("tagNumber", r.getTagNumber());
            recordInfo.put("checkInTime", r.getCheckInTime());
            return recordInfo;
        }).collect(java.util.stream.Collectors.toList()));
        
        return org.springframework.http.ResponseEntity.ok(
            com.airport.kiosk.dto.ApiResponse.success(debugInfo, "Baggage debug info retrieved successfully")
        );
    }
    
    /**
     * Generate unique tag number for baggage
     */
    private String generateTagNumber(String flightId) {
        return flightId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

