package com.airport.kiosk.repository;

import com.airport.kiosk.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, String> {
    List<Seat> findByFlightId(String flightId);
    
    @Query("SELECT s FROM Seat s WHERE s.flightId = :flightId AND s.seatId = :seatId")
    Optional<Seat> findByFlightIdAndSeatId(@Param("flightId") String flightId, @Param("seatId") String seatId);
    
    @Query("SELECT s FROM Seat s WHERE s.flightId = :flightId AND s.lockExpiry < :now AND s.seatStatus = 'LOCKED'")
    List<Seat> findExpiredLocks(@Param("flightId") String flightId, @Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.flightId = :flightId AND s.seatStatus = 'AVAILABLE'")
    Long countAvailableSeatsByFlightId(@Param("flightId") String flightId);
    
    @Query("SELECT s FROM Seat s WHERE s.flightId = :flightId AND s.bookingId IS NOT NULL AND UPPER(s.bookingId) = UPPER(:bookingId) AND s.seatStatus = 'RESERVED'")
    List<Seat> findByFlightIdAndBookingIdAndReserved(@Param("flightId") String flightId, @Param("bookingId") String bookingId);
}

