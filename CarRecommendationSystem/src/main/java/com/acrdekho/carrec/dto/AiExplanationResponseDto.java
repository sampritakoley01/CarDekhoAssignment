package com.acrdekho.carrec.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiExplanationResponseDto {
    private String carId;
    private String explanation;
}
