package com.airport.kiosk.repository;

import com.airport.kiosk.model.BaggageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaggageRepository extends JpaRepository<BaggageRecord, String> {
    Optional<BaggageRecord> findByBaggageId(String baggageId);
    List<BaggageRecord> findByBookingId(String bookingId);
    List<BaggageRecord> findByFlightId(String flightId);
    Optional<BaggageRecord> findByTagNumber(String tagNumber);
    
    @Query("SELECT COUNT(b) FROM BaggageRecord b WHERE b.flightId = :flightId")
    Long countByFlightId(@Param("flightId") String flightId);
}

