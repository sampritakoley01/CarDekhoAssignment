package com.acrdekho.carrec.service;

import com.acrdekho.carrec.model.Car;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarDataService {

    private final ObjectMapper objectMapper;

    @Value("classpath:data/cars.json")
    private Resource carsJsonResource;

    private List<Car> cars = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            log.info("Loading cars data from JSON: {}", carsJsonResource.getFilename());
            if (!carsJsonResource.exists()) {
                log.error("cars.json file not found in resources/data/cars.json");
                return;
            }
            try (InputStream inputStream = carsJsonResource.getInputStream()) {
                CarDataWrapper wrapper = objectMapper.readValue(inputStream, CarDataWrapper.class);
                if (wrapper != null && wrapper.getValue() != null) {
                    cars = wrapper.getValue();
                }
                log.info("Successfully loaded {} cars from JSON dataset", cars.size());
            }
        } catch (Exception e) {
            log.error("Failed to load cars data from JSON", e);
        }
    }

    public List<Car> getAllCars() {
        return cars.stream()
                .filter(Car::getIsActive)
                .collect(Collectors.toList());
    }

    public Optional<Car> getCarById(String id) {
        return cars.stream()
                .filter(car -> car.getId().equalsIgnoreCase(id) && car.getIsActive())
                .findFirst();
    }

    public List<Car> searchCars(String brand, String bodyType, String fuelType, String transmission, Double maxPrice) {
        return cars.stream()
                .filter(Car::getIsActive)
                .filter(car -> brand == null || car.getBrand().equalsIgnoreCase(brand))
                .filter(car -> bodyType == null || car.getBodyType().equalsIgnoreCase(bodyType))
                .filter(car -> fuelType == null || car.getFuelType().equalsIgnoreCase(fuelType))
                .filter(car -> transmission == null || car.getTransmission().equalsIgnoreCase(transmission))
                .filter(car -> maxPrice == null || car.getPrice() <= maxPrice)
                .collect(Collectors.toList());
    }

    public List<String> getUniqueFuelTypes() {
        return cars.stream()
                .filter(Car::getIsActive)
                .map(Car::getFuelType)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> getUniqueBodyTypes() {
        return cars.stream()
                .filter(Car::getIsActive)
                .map(Car::getBodyType)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> getUniqueTransmissions() {
        return cars.stream()
                .filter(Car::getIsActive)
                .map(Car::getTransmission)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @lombok.Data
    private static class CarDataWrapper {
        private List<Car> value;
    }
}
