package com.acrdekho.carrec.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonResponseDto {
    private ComparisonDetail car1;
    private ComparisonDetail car2;
    private String winner;
    private String aiSummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonDetail {
        private String carId;
        private String brand;
        private String model;
        private String variant;
        private Double price;
        private Double mileage;
        private Integer engineCc;
        private Integer safetyRating;
        private Integer groundClearance;
        private Integer bootSpace;
        private Integer airbags;
        private Boolean adas;
    }
}
