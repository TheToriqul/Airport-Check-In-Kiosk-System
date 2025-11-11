package com.airport.kiosk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatAssignmentResponse {
    private String seatId;
    private String seatNumber;
    private String seatClass;
    private String seatStatus;
    private String bookingId;
    private String passengerName;
    private String passportNumber;
    private String email;
    private String phone;
    private String flightId;
    private String flightNumber;
    private String departureAirport;
    private String arrivalAirport;
    private String departureTime;
    private String arrivalTime;
}

