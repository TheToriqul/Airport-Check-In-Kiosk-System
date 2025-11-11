package com.airport.kiosk.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BaggageCheckInRequest {
    private BigDecimal weight;
    private Integer count;
}

