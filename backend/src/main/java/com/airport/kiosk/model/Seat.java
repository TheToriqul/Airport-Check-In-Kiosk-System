package com.airport.kiosk.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"flight_id", "seat_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seat {
    
    @Id
    @Column(name = "seat_id", length = 50)
    private String seatId;
    
    @Column(name = "flight_id", nullable = false, length = 50)
    private String flightId;
    
    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_class", nullable = false)
    private SeatClass seatClass = SeatClass.ECONOMY;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_status", nullable = false)
    private SeatStatus seatStatus = SeatStatus.AVAILABLE;
    
    @Column(name = "booking_id", length = 50)
    private String bookingId;
    
    @Column(name = "locked_by", length = 100)
    private String lockedBy;
    
    @Column(name = "lock_expiry")
    private LocalDateTime lockExpiry;
    
    @Version
    @Column(name = "version")
    private Long version = 0L;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum SeatClass {
        ECONOMY, BUSINESS, FIRST
    }
    
    public enum SeatStatus {
        AVAILABLE, LOCKED, RESERVED, OCCUPIED
    }
}

