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
public class FilterResponseDto {
    private List<String> fuelTypes;
    private List<String> bodyTypes;
    private List<String> transmissions;
    private List<String> priorities;
}
