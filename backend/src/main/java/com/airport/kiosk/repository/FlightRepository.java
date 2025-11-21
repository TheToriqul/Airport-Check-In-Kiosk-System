package com.airport.kiosk.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.airport.kiosk.model.Flight;

@Repository
public interface FlightRepository extends JpaRepository<Flight, String> {
    Optional<Flight> findByFlightId(String flightId);
    
    @Modifying
    @Query("UPDATE Flight f SET f.availableSeats = f.availableSeats - 1 WHERE f.flightId = :flightId")
    void decrementAvailableSeats(@Param("flightId") String flightId);
    
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "UPDATE flights SET baggage_count = baggage_count + :count WHERE flight_id = :flightId", nativeQuery = true)
    void incrementBaggageCount(@Param("flightId") String flightId, @Param("count") Integer count);
    
    @Modifying
    @Query("UPDATE Flight f SET f.availableSeats = f.availableSeats + 1 WHERE f.flightId = :flightId")
    void incrementAvailableSeats(@Param("flightId") String flightId);
    
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "UPDATE flights SET baggage_count = baggage_count - :count WHERE flight_id = :flightId", nativeQuery = true)
    void decrementBaggageCount(@Param("flightId") String flightId, @Param("count") Integer count);
}

