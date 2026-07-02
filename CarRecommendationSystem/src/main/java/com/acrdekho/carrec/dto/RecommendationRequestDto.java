package com.acrdekho.carrec.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationRequestDto {

    @NotNull(message = "Budget is required")
    @Min(value = 100000, message = "Budget must be at least 100,000")
    private Double budget;

    @NotBlank(message = "Fuel type is required")
    private String fuelType;

    @NotBlank(message = "Body type is required")
    private String bodyType;

    @NotNull(message = "Family size is required")
    @Min(value = 1, message = "Family size must be at least 1")
    private Integer familySize;

    @NotNull(message = "Daily running in km is required")
    @Min(value = 0, message = "Daily running km must be positive")
    private Integer dailyRunningKm;

    @NotBlank(message = "Transmission is required")
    private String transmission;

    @NotBlank(message = "Priority is required")
    private String priority;
}
