package com.acrdekho.carrec.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDto {

    @NotBlank(message = "Recommendation ID is required")
    private String recommendationId;

    @NotBlank(message = "Message is required")
    private String message;
}
