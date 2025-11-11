package com.airport.kiosk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AirportKioskApplication {

    public static void main(String[] args) {
        SpringApplication.run(AirportKioskApplication.class, args);
    }
}

