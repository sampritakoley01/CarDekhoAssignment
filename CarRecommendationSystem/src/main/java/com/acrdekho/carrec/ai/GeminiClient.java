package com.acrdekho.carrec.ai;

import com.acrdekho.carrec.exception.GeminiApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.model}")
    private String model;

    @Value("${gemini.api.key}")
    private String apiKey;

    public String generateContent(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new GeminiApiException("Gemini API key is not configured.");
        }

        String url = String.format("%s/%s:generateContent?key=%s", apiUrl, model, apiKey);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct Gemini Request Body
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Sending request to Gemini API model: {}", model);
            String responseStr = restTemplate.postForObject(url, entity, String.class);

            // Extract the text from response
            JsonNode root = objectMapper.readTree(responseStr);
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode()) {
                log.error("Invalid response from Gemini API: {}", responseStr);
                throw new GeminiApiException("Gemini API response did not contain expected content.");
            }

            return textNode.asText();
        } catch (Exception e) {
            log.error("Error communicating with Gemini API", e);
            throw new GeminiApiException("Failed to get recommendation from Gemini AI: " + e.getMessage(), e);
        }
    }

    public boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }
}
