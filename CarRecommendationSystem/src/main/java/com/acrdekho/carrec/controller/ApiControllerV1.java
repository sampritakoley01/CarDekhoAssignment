package com.acrdekho.carrec.controller;

import com.acrdekho.carrec.dto.*;
import com.acrdekho.carrec.exception.ResourceNotFoundException;
import com.acrdekho.carrec.model.Car;
import com.acrdekho.carrec.service.CarDataService;
import com.acrdekho.carrec.service.CarRecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller exposing all v1 Car Recommendation APIs.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ApiControllerV1 {

    private final CarDataService carDataService;
    private final CarRecommendationService recommendationService;

    /**
     * API 1: Return all available filter values required by the frontend questionnaire.
     */
    @GetMapping("/filters")
    public ResponseEntity<FilterResponseDto> getFilters() {
        log.info("API 1: GET /api/v1/filters called");
        FilterResponseDto response = FilterResponseDto.builder()
                .fuelTypes(carDataService.getUniqueFuelTypes())
                .bodyTypes(carDataService.getUniqueBodyTypes())
                .transmissions(carDataService.getUniqueTransmissions())
                .priorities(List.of("Safety", "Mileage", "Performance", "Comfort", "Features"))
                .build();
        return ResponseEntity.ok(response);
    }

    /**
     * API 2: Accept user preferences, calculate recommendation score, rank and return top 5.
     */
    @PostMapping("/recommendation")
    public ResponseEntity<RecommendationResponseDto> getRecommendation(
            @Valid @RequestBody RecommendationRequestDto request) {
        log.info("API 2: POST /api/v1/recommendation called");
        RecommendationResponseDto response = recommendationService.getRecommendation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * API 3: Compare two selected cars side-by-side.
     */
    @PostMapping("/compare")
    public ResponseEntity<ComparisonResponseDto> compareCars(
            @Valid @RequestBody ComparisonRequestDto request) {
        log.info("API 3: POST /api/v1/compare called");
        ComparisonResponseDto response = recommendationService.compareCars(request);
        return ResponseEntity.ok(response);
    }

    /**
     * API 4: Generate a detailed AI explanation for why a selected recommendation is better than others.
     */
    @PostMapping("/ai/explanation")
    public ResponseEntity<AiExplanationResponseDto> getDetailExplanation(
            @Valid @RequestBody AiExplanationRequestDto request) {
        log.info("API 4: POST /api/v1/ai/explanation called");
        AiExplanationResponseDto response = recommendationService.getDetailExplanation(request);
        return ResponseEntity.ok(response);
    }

    /**
     * API 5: Chat assistant for follow-up questions maintaining context.
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDto> chat(
            @Valid @RequestBody ChatRequestDto request) {
        log.info("API 5: POST /api/v1/chat called");
        ChatResponseDto response = recommendationService.processChat(request);
        return ResponseEntity.ok(response);
    }

    /**
     * API 6: Return complete details of one selected car.
     */
    @GetMapping("/cars/{id}")
    public ResponseEntity<CarDto> getCarById(@PathVariable String id) {
        log.info("API 6: GET /api/v1/cars/{} called", id);
        Car car = carDataService.getCarById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));
        return ResponseEntity.ok(CarDto.fromEntity(car));
    }
}
