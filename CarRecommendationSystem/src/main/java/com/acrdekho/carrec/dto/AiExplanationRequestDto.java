package com.acrdekho.carrec.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiExplanationRequestDto {

    @NotBlank(message = "Recommendation ID is required")
    private String recommendationId;

    @NotBlank(message = "Selected Car ID is required")
    private String selectedCarId;
}
