package com.airport.kiosk.repository;

import com.airport.kiosk.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, String> {
    Optional<Flight> findByFlightId(String flightId);
    
    @Modifying
    @Query("UPDATE Flight f SET f.availableSeats = f.availableSeats - 1 WHERE f.flightId = :flightId")
    void decrementAvailableSeats(@Param("flightId") String flightId);
    
    @Modifying
    @Query("UPDATE Flight f SET f.baggageCount = f.baggageCount + :count WHERE f.flightId = :flightId")
    void incrementBaggageCount(@Param("flightId") String flightId, @Param("count") Integer count);
    
    @Modifying
    @Query("UPDATE Flight f SET f.availableSeats = f.availableSeats + 1 WHERE f.flightId = :flightId")
    void incrementAvailableSeats(@Param("flightId") String flightId);
}

