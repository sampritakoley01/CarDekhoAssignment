package com.acrdekho.carrec.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponseDto {
    private String recommendationId;
    private List<RecommendedCarDto> recommendedCars;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedCarDto {
        private String carId;
        private String brand;
        private String model;
        private String variant;
        private Double price;
        private Integer matchScore;
        private String aiExplanation;
    }
}
