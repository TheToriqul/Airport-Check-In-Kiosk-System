package com.airport.kiosk.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.airport.kiosk.model.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    Optional<Booking> findByBookingId(String bookingId);
    
    // Case-insensitive search using native SQL with UPPER() function
    @Query(value = "SELECT * FROM bookings WHERE UPPER(booking_id) = UPPER(:bookingId)", nativeQuery = true)
    Optional<Booking> findByBookingIdIgnoreCase(@Param("bookingId") String bookingId);
    
    Optional<Booking> findByPassportNumber(String passportNumber);
    
    // Case-insensitive search using native SQL with UPPER() function
    @Query(value = "SELECT * FROM bookings WHERE UPPER(passport_number) = UPPER(:passportNumber)", nativeQuery = true)
    Optional<Booking> findByPassportNumberIgnoreCase(@Param("passportNumber") String passportNumber);
}

