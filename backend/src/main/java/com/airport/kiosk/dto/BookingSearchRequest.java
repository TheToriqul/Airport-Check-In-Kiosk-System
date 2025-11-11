package com.airport.kiosk.dto;

import lombok.Data;

@Data
public class BookingSearchRequest {
    private String bookingReference;
    private String passportNumber;
}

