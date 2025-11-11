package com.airport.kiosk.dto;

import lombok.Data;

@Data
public class SeatConfirmRequest {
    private String bookingId;
    private String sessionId;
}

