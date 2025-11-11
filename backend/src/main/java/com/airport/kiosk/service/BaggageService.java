package com.airport.kiosk.service;

import com.airport.kiosk.model.BaggageRecord;
import com.airport.kiosk.model.Flight;
import com.airport.kiosk.repository.BaggageRepository;
import com.airport.kiosk.repository.FlightRepository;
import com.airport.kiosk.exception.FlightNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BaggageService {
    
    private final FlightRepository flightRepository;
    private final BaggageRepository baggageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Atomically increment baggage count for a flight
     * Uses synchronized method and REPEATABLE_READ isolation level
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public synchronized BaggageRecord checkInBaggage(String bookingId, String flightId, 
                                                      BigDecimal weight, Integer count) {
        // Verify flight exists
        Flight flight = flightRepository.findByFlightId(flightId)
            .orElseThrow(() -> new FlightNotFoundException("Flight not found: " + flightId));
        
        // Use atomic SQL increment to prevent race conditions
        flightRepository.incrementBaggageCount(flightId, count);
        
        // Refresh entity to get updated count
        flight = flightRepository.findByFlightId(flightId)
            .orElseThrow(() -> new FlightNotFoundException("Flight not found: " + flightId));
        
        // Create baggage record
        BaggageRecord baggage = new BaggageRecord();
        baggage.setBaggageId(UUID.randomUUID().toString());
        baggage.setBookingId(bookingId);
        baggage.setFlightId(flightId);
        baggage.setBaggageWeight(weight);
        baggage.setBaggageCount(count);
        baggage.setTagNumber(generateTagNumber(flightId));
        baggage.setCheckInTime(LocalDateTime.now());
        
        baggageRepository.save(baggage);
        
        // Broadcast baggage count update
        Map<String, Object> event = new HashMap<>();
        event.put("flightId", flightId);
        event.put("count", flight.getBaggageCount());
        
        messagingTemplate.convertAndSend("/topic/flights/" + flightId + "/baggage", event);
        
        return baggage;
    }
    
    /**
     * Get baggage count for a flight
     */
    public Long getBaggageCount(String flightId) {
        return baggageRepository.countByFlightId(flightId);
    }
    
    /**
     * Generate unique tag number for baggage
     */
    private String generateTagNumber(String flightId) {
        return flightId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

