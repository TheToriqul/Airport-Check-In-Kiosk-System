package com.airport.kiosk.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.airport.kiosk.exception.FlightNotFoundException;
import com.airport.kiosk.model.Flight;
import com.airport.kiosk.repository.FlightRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FlightService {
    
    private final FlightRepository flightRepository;
    
    /**
     * Get all flights sorted by departure time (ascending - today to future)
     * Returns all flights sorted by departure time, which naturally shows
     * today's and future flights first, followed by past flights
     */
    public List<Flight> getAllFlights() {
        return flightRepository.findAll().stream()
            .sorted((f1, f2) -> f1.getDepartureTime().compareTo(f2.getDepartureTime()))
            .collect(Collectors.toList());
    }
    
    /**
     * Get flight by ID
     */
    public Flight getFlightById(String flightId) {
        return flightRepository.findByFlightId(flightId)
            .orElseThrow(() -> new FlightNotFoundException("Flight not found: " + flightId));
    }
}

