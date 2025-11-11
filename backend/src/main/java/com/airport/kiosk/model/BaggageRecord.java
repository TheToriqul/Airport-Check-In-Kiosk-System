package com.airport.kiosk.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "baggage_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaggageRecord {
    
    @Id
    @Column(name = "baggage_id", length = 50)
    private String baggageId;
    
    @Column(name = "booking_id", nullable = false, length = 50)
    private String bookingId;
    
    @Column(name = "flight_id", nullable = false, length = 50)
    private String flightId;
    
    @Column(name = "baggage_weight", precision = 5, scale = 2)
    private BigDecimal baggageWeight;
    
    @Column(name = "baggage_count", nullable = false)
    private Integer baggageCount = 1;
    
    @Column(name = "tag_number", nullable = false, unique = true, length = 50)
    private String tagNumber;
    
    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;
    
    @PrePersist
    protected void onCreate() {
        if (checkInTime == null) {
            checkInTime = LocalDateTime.now();
        }
    }
}

