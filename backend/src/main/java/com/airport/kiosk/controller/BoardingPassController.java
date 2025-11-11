package com.airport.kiosk.controller;

import com.airport.kiosk.dto.ApiResponse;
import com.airport.kiosk.service.BoardingPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings/{bookingId}/boarding-pass")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BoardingPassController {
    
    private final BoardingPassService boardingPassService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Object>> generateBoardingPass(@PathVariable String bookingId) {
        try {
            Object result = boardingPassService.generateBoardingPass(bookingId);
            return ResponseEntity.ok(ApiResponse.success(result, "Boarding pass generated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "BOARDING_PASS_ERROR"));
        }
    }
    
    @GetMapping("/pdf")
    public ResponseEntity<String> getBoardingPassPdf(@PathVariable String bookingId) {
        // PDF generation would be implemented here
        // For now, return a placeholder
        return ResponseEntity.ok("PDF generation not yet implemented");
    }
}

