package com.acrdekho.carrec.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferenceDto {

    @NotNull(message = "Budget cannot be null")
    @Min(value = 0, message = "Budget must be a positive value")
    private Double maxBudget;

    private String fuelType;
    private String bodyType;
    private String transmission;

    @Min(value = 2, message = "Seating capacity must be at least 2")
    private Integer seatingCapacity;

    private String primaryUsage; // e.g. "Daily City Commute", "Weekend Highway trips", "Off-road"
    private List<String> mustHaveFeatures; // e.g. "sunroof", "adas", "ventilated seats", etc.
    private String customRequirements; // e.g. "Looking for family car with high safety rating"
}
