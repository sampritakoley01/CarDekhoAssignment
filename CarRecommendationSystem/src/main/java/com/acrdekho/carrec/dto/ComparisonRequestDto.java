package com.acrdekho.carrec.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonRequestDto {

    @NotNull(message = "Car IDs cannot be null")
    @Size(min = 2, max = 2, message = "Exactly two car IDs must be provided for comparison")
    private List<String> carIds;
}
