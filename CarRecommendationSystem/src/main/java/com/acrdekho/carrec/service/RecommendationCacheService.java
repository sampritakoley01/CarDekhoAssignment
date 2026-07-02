package com.acrdekho.carrec.service;

import com.acrdekho.carrec.dto.RecommendationRequestDto;
import com.acrdekho.carrec.dto.RecommendationResponseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RecommendationCacheService {

    private final Map<String, RecommendationContext> cache = new ConcurrentHashMap<>();

    @Data
    @AllArgsConstructor
    public static class RecommendationContext {
        private String recommendationId;
        private RecommendationRequestDto request;
        private RecommendationResponseDto response;
    }

    public void put(String id, RecommendationRequestDto request, RecommendationResponseDto response) {
        cache.put(id, new RecommendationContext(id, request, response));
    }

    public Optional<RecommendationContext> get(String id) {
        return Optional.ofNullable(cache.get(id));
    }
}
