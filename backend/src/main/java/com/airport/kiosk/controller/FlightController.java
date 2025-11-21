package com.airport.kiosk.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airport.kiosk.dto.ApiResponse;
import com.airport.kiosk.model.Flight;
import com.airport.kiosk.service.FlightService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FlightController {
    
    private final FlightService flightService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAllFlights() {
        try {
            List<Flight> flights = flightService.getAllFlights();
            return ResponseEntity.ok(ApiResponse.success(flights, "Flights retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "FLIGHT_ERROR"));
        }
    }
    
    @GetMapping("/{flightId}")
    public ResponseEntity<ApiResponse<Object>> getFlightById(@PathVariable String flightId) {
        try {
            Flight flight = flightService.getFlightById(flightId);
            return ResponseEntity.ok(ApiResponse.success(flight, "Flight retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "FLIGHT_NOT_FOUND"));
        }
    }
}

