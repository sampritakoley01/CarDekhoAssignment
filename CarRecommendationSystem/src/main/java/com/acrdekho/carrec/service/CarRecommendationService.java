package com.acrdekho.carrec.service;

import com.acrdekho.carrec.ai.GeminiClient;
import com.acrdekho.carrec.dto.*;
import com.acrdekho.carrec.exception.ResourceNotFoundException;
import com.acrdekho.carrec.model.Car;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarRecommendationService {

    private final CarDataService carDataService;
    private final GeminiClient geminiClient;
    private final RecommendationCacheService cacheService;
    private final ObjectMapper objectMapper;

    private final AtomicInteger recommendationCounter = new AtomicInteger(0);

    /**
     * API 2: Accept user preferences, calculate scores, rank, and return top 5 recommendations with AI explanation.
     */
    public RecommendationResponseDto getRecommendation(RecommendationRequestDto request) {
        log.info("Processing recommendation request: budget={}, priority={}", request.getBudget(), request.getPriority());
        
        List<Car> allCars = carDataService.getAllCars();
        if (allCars.isEmpty()) {
            throw new ResourceNotFoundException("No cars available in the dataset.");
        }

        // Calculate scores and sort
        List<ScoredCar> scoredCars = allCars.stream()
                .map(car -> calculateScore(car, request))
                .sorted(Comparator.comparingInt(ScoredCar::getScore).reversed()
                        .thenComparingDouble(sc -> sc.getCar().getPrice()))
                .limit(5)
                .collect(Collectors.toList());

        String recommendationId = String.format("REC-%03d", recommendationCounter.incrementAndGet());

        // Construct DTOs
        List<RecommendationResponseDto.RecommendedCarDto> recommendedCars = new ArrayList<>();
        
        if (geminiClient.isApiKeyConfigured()) {
            try {
                // Call Gemini to generate short explanations for the top cars in bulk
                recommendedCars = generateAiExplanationsBulk(scoredCars, request);
            } catch (Exception e) {
                log.warn("Failed to generate AI explanations for recommendation: {}. Falling back to rule-based.", e.getMessage());
                recommendedCars = generateFallbackExplanations(scoredCars, request);
            }
        } else {
            log.info("Gemini API key not configured. Using rule-based local explanation generation.");
            recommendedCars = generateFallbackExplanations(scoredCars, request);
        }

        RecommendationResponseDto response = RecommendationResponseDto.builder()
                .recommendationId(recommendationId)
                .recommendedCars(recommendedCars)
                .build();

        // Save to in-memory session cache for API 4 & 5
        cacheService.put(recommendationId, request, response);
        return response;
    }

    /**
     * API 3: Compare two selected cars side-by-side.
     */
    public ComparisonResponseDto compareCars(ComparisonRequestDto request) {
        String carId1 = request.getCarIds().get(0);
        String carId2 = request.getCarIds().get(1);

        Car car1 = carDataService.getCarById(carId1)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId1));
        Car car2 = carDataService.getCarById(carId2)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId2));

        ComparisonResponseDto.ComparisonDetail detail1 = mapToComparisonDetail(car1);
        ComparisonResponseDto.ComparisonDetail detail2 = mapToComparisonDetail(car2);

        String winner = determineWinner(car1, car2);
        String aiSummary;

        if (geminiClient.isApiKeyConfigured()) {
            try {
                String prompt = String.format(
                        "You are an expert car reviewer. Compare these two cars side-by-side and provide a clean 3-sentence summary highlighting key differences in price, safety, features, and engine, and justify the winner.\n\n" +
                        "Car 1: %s %s (%s, Price: INR %.2f)\n" +
                        "Car 2: %s %s (%s, Price: INR %.2f)\n\n" +
                        "Selected Winner: %s\n\n" +
                        "Return only a JSON object containing the field 'aiSummary' without markdown blocks.",
                        car1.getBrand(), car1.getModel(), car1.getVarient(), car1.getPrice(),
                        car2.getBrand(), car2.getModel(), car2.getVarient(), car2.getPrice(),
                        winner
                );
                String aiResponse = geminiClient.generateContent(prompt);
                JsonNode root = objectMapper.readTree(aiResponse);
                aiSummary = root.path("aiSummary").asText("Comparison summary generated successfully.");
            } catch (Exception e) {
                log.warn("Gemini comparison summary failed, using rule-based summary: {}", e.getMessage());
                aiSummary = generateFallbackComparisonSummary(car1, car2, winner);
            }
        } else {
            aiSummary = generateFallbackComparisonSummary(car1, car2, winner);
        }

        return ComparisonResponseDto.builder()
                .car1(detail1)
                .car2(detail2)
                .winner(winner)
                .aiSummary(aiSummary)
                .build();
    }

    /**
     * API 4: Detailed explanation of why one selected car is better than remaining recommendations.
     */
    public AiExplanationResponseDto getDetailExplanation(AiExplanationRequestDto request) {
        String recId = request.getRecommendationId();
        String selectedCarId = request.getSelectedCarId();

        RecommendationCacheService.RecommendationContext context = cacheService.get(recId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation context not found for ID: " + recId));

        Car selectedCar = carDataService.getCarById(selectedCarId)
                .orElseThrow(() -> new ResourceNotFoundException("Selected car not found: " + selectedCarId));

        List<String> otherCarModels = context.getResponse().getRecommendedCars().stream()
                .filter(c -> !c.getCarId().equals(selectedCarId))
                .map(c -> c.getBrand() + " " + c.getModel())
                .collect(Collectors.toList());

        String explanation;

        if (geminiClient.isApiKeyConfigured()) {
            try {
                String prompt = String.format(
                        "You are an expert car consultant. The user previously entered these preferences: budget=%.2f, priority=%s.\n" +
                        "Out of the recommendations, they selected the '%s %s %s'.\n" +
                        "Write a comprehensive 4-sentence paragraph explaining why the selected car is a superior choice for their specific profile compared to the other options they were recommended: %s.\n" +
                        "Return only a JSON object containing the field 'explanation' without markdown formatting.",
                        context.getRequest().getBudget(), context.getRequest().getPriority(),
                        selectedCar.getBrand(), selectedCar.getModel(), selectedCar.getVarient(),
                        String.join(", ", otherCarModels)
                );
                String responseStr = geminiClient.generateContent(prompt);
                JsonNode root = objectMapper.readTree(responseStr);
                explanation = root.path("explanation").asText();
            } catch (Exception e) {
                log.warn("Failed to generate detailed AI explanation: {}", e.getMessage());
                explanation = generateFallbackDetailedExplanation(selectedCar, context.getRequest(), otherCarModels);
            }
        } else {
            explanation = generateFallbackDetailedExplanation(selectedCar, context.getRequest(), otherCarModels);
        }

        return new AiExplanationResponseDto(selectedCarId, explanation);
    }

    /**
     * API 5: Context-aware follow-up chat.
     */
    public ChatResponseDto processChat(ChatRequestDto request) {
        String recId = request.getRecommendationId();
        RecommendationCacheService.RecommendationContext context = cacheService.get(recId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation context not found for ID: " + recId));

        String reply;

        if (geminiClient.isApiKeyConfigured()) {
            try {
                String prompt = String.format(
                        "You are an AI Car Recommendation Assistant representing 'Car Dekho'.\n" +
                        "The user previously requested recommendations with preferences:\n" +
                        "- Budget: INR %.2f\n" +
                        "- Fuel: %s, Transmission: %s, Priority: %s\n\n" +
                        "We recommended these cars to them:\n" +
                        "%s\n\n" +
                        "The user is asking this follow-up question: \"%s\"\n\n" +
                        "Provide a helpful, precise response in 3 sentences max maintaining context.\n" +
                        "Return only a JSON object containing the field 'reply' without markdown blocks.",
                        context.getRequest().getBudget(), context.getRequest().getFuelType(),
                        context.getRequest().getTransmission(), context.getRequest().getPriority(),
                        context.getResponse().getRecommendedCars().stream()
                                .map(c -> String.format("- %s %s (Score: %d%%)", c.getBrand(), c.getModel(), c.getMatchScore()))
                                .collect(Collectors.joining("\n")),
                        request.getMessage()
                );
                String responseStr = geminiClient.generateContent(prompt);
                JsonNode root = objectMapper.readTree(responseStr);
                reply = root.path("reply").asText("Let me check that details for you.");
            } catch (Exception e) {
                log.warn("Gemini chat failed, using fallback chat reply: {}", e.getMessage());
                reply = "I'm sorry, I'm currently unable to connect to Gemini AI to answer your follow-up questions. Please try again shortly.";
            }
        } else {
            reply = "AI chat capability is currently disabled since the Gemini API key is not configured.";
        }

        return new ChatResponseDto(reply);
    }

    // --- Scoring & Helper Methods ---

    @lombok.Value
    private static class ScoredCar {
        Car car;
        int score;
    }

    private ScoredCar calculateScore(Car car, RecommendationRequestDto req) {
        int score = 0;

        // 1. Budget Match (Max 30 pts)
        if (car.getPrice() <= req.getBudget()) {
            score += 30;
        } else if (car.getPrice() <= req.getBudget() * 1.10) {
            score += 10; // 10% buffer
        }

        // 2. Fuel Type Match (Max 15 pts)
        if (car.getFuelType().equalsIgnoreCase(req.getFuelType())) {
            score += 15;
        }

        // 3. Body Type Match (Max 15 pts)
        if (car.getBodyType().equalsIgnoreCase(req.getBodyType())) {
            score += 15;
        }

        // 4. Transmission Match (Max 15 pts)
        if (car.getTransmission().equalsIgnoreCase(req.getTransmission())) {
            score += 15;
        }

        // 5. Family Size / Seating Match (Max 15 pts)
        if (car.getSeatingCapacity() >= req.getFamilySize()) {
            score += 15;
        }

        // 6. Priority Match (Max 10 pts)
        String priority = req.getPriority().toLowerCase();
        if (priority.contains("safety")) {
            score += car.getSafetyRating() * 2; // e.g. 5 rating -> +10
        } else if (priority.contains("mileage")) {
            if (car.getMileag() > 20.0) score += 10;
            else if (car.getMileag() > 16.0) score += 6;
            else if (car.getMileag() > 12.0) score += 3;
        } else if (priority.contains("performance")) {
            if (car.getPowerBhp() > 150.0) score += 10;
            else if (car.getPowerBhp() > 110.0) score += 6;
        } else if (priority.contains("comfort")) {
            if (Boolean.TRUE.equals(car.getSunroof())) score += 4;
            if (Boolean.TRUE.equals(car.getCruiseControl())) score += 3;
            if (Boolean.TRUE.equals(car.getTouchScreen())) score += 3;
        } else if (priority.contains("features")) {
            if (Boolean.TRUE.equals(car.getAdas())) score += 4;
            if (Boolean.TRUE.equals(car.getAlloyWheel())) score += 3;
            if (car.getAirbags() >= 6) score += 3;
        }

        // Bound check (limit score to 100)
        return new ScoredCar(car, Math.min(score, 100));
    }

    private List<RecommendationResponseDto.RecommendedCarDto> generateAiExplanationsBulk(List<ScoredCar> scoredCars, RecommendationRequestDto req) throws Exception {
        // Construct prompt to generate reasons for all 5 cars in one API call
        StringBuilder carsListBuilder = new StringBuilder();
        for (int i = 0; i < scoredCars.size(); i++) {
            Car car = scoredCars.get(i).getCar();
            carsListBuilder.append(String.format("Index %d: ID=%s, %s %s, Variant=%s, Price=INR %.0f, Safety=%d/5, Mileage=%.1f\n",
                    i, car.getId(), car.getBrand(), car.getModel(), car.getVarient(), car.getPrice(), car.getSafetyRating(), car.getMileag()));
        }

        String prompt = String.format(
                "You are an AI car recommender. Generate a short, tailored 1-sentence explanation for each of the following recommended cars. " +
                "The explanation must explain how it fits the user's priority '%s' and budget of INR %.0f.\n\n" +
                "CARS LIST:\n%s\n" +
                "Return only a JSON object matching this schema without markdown block formatting:\n" +
                "{\n" +
                "  \"explanations\": [\n" +
                "    { \"carId\": \"car_id_here\", \"reason\": \"explanation_here\" }\n" +
                "  ]\n" +
                "}",
                req.getPriority(), req.getBudget(), carsListBuilder.toString()
        );

        String aiResponse = geminiClient.generateContent(prompt);
        JsonNode root = objectMapper.readTree(aiResponse);
        JsonNode explanationsNode = root.path("explanations");

        Map<String, String> explanationsMap = new HashMap<>();
        if (explanationsNode.isArray()) {
            for (JsonNode exp : explanationsNode) {
                explanationsMap.put(exp.path("carId").asText(), exp.path("reason").asText());
            }
        }

        return scoredCars.stream()
                .map(sc -> {
                    Car car = sc.getCar();
                    String explanation = explanationsMap.getOrDefault(car.getId(),
                            String.format("Fits your priority of %s and falls within budget.", req.getPriority()));
                    return RecommendationResponseDto.RecommendedCarDto.builder()
                            .carId(car.getId())
                            .brand(car.getBrand())
                            .model(car.getModel())
                            .variant(car.getVarient())
                            .price(car.getPrice())
                            .matchScore(sc.getScore())
                            .aiExplanation(explanation)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<RecommendationResponseDto.RecommendedCarDto> generateFallbackExplanations(List<ScoredCar> scoredCars, RecommendationRequestDto req) {
        return scoredCars.stream()
                .map(sc -> {
                    Car car = sc.getCar();
                    String explanation = String.format("A perfect %s option with a safety rating of %d/5, matching your budget of INR %,.0f.",
                            car.getBodyType(), car.getSafetyRating(), req.getBudget());
                    if ("Mileage".equalsIgnoreCase(req.getPriority())) {
                        explanation = String.format("Highly efficient %s option delivering %.1f kmpl/km range, within your budget.",
                                car.getBodyType(), car.getMileag());
                    }
                    return RecommendationResponseDto.RecommendedCarDto.builder()
                            .carId(car.getId())
                            .brand(car.getBrand())
                            .model(car.getModel())
                            .variant(car.getVarient())
                            .price(car.getPrice())
                            .matchScore(sc.getScore())
                            .aiExplanation(explanation)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private ComparisonResponseDto.ComparisonDetail mapToComparisonDetail(Car car) {
        return ComparisonResponseDto.ComparisonDetail.builder()
                .carId(car.getId())
                .brand(car.getBrand())
                .model(car.getModel())
                .variant(car.getVarient())
                .price(car.getPrice())
                .mileage(car.getMileag())
                .engineCc(car.getEngineCc())
                .safetyRating(car.getSafetyRating())
                .groundClearance(car.getGroundClearance())
                .bootSpace(car.getBootSpace())
                .airbags(car.getAirbags())
                .adas(car.getAdas())
                .build();
    }

    private String determineWinner(Car car1, Car car2) {
        // Winner determined by a combination of safety, rating, and value
        double score1 = car1.getRating() * 2 + car1.getSafetyRating();
        double score2 = car2.getRating() * 2 + car2.getSafetyRating();

        if (score1 > score2) {
            return car1.getBrand() + " " + car1.getModel();
        } else if (score2 > score1) {
            return car2.getBrand() + " " + car2.getModel();
        } else {
            return car1.getPrice() <= car2.getPrice() ?
                    car1.getBrand() + " " + car1.getModel() : car2.getBrand() + " " + car2.getModel();
        }
    }

    private String generateFallbackComparisonSummary(Car car1, Car car2, String winner) {
        return String.format(
                "Comparing the %s %s and %s %s side by side. The %s leads in performance and features. However, the %s emerges as the winner due to better overall value, safety rating, and ownership ratings.",
                car1.getBrand(), car1.getModel(), car2.getBrand(), car2.getModel(),
                car1.getPowerBhp() > car2.getPowerBhp() ? car1.getModel() : car2.getModel(),
                winner
        );
    }

    private String generateFallbackDetailedExplanation(Car car, RecommendationRequestDto req, List<String> others) {
        return String.format(
                "The %s %s stands out as the ideal option because it offers the highest safety rating of %d/5 and complete peace of mind, which perfectly aligns with your '%s' priority. Compared to other recommended models like %s, it delivers the most balanced mix of power (%s bhp), high ground clearance (%s mm), and value under your budget of INR %,.0f.",
                car.getBrand(), car.getModel(), car.getSafetyRating(), req.getPriority(),
                String.join(", ", others), car.getPowerBhp(), car.getGroundClearance(), req.getBudget()
        );
    }
}
