package com.acrdekho.carrec.dto;

import com.acrdekho.carrec.model.Car;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarDto {
    private String id;
    private String brand;
    private String model;
    private String varient;
    private String bodyType;
    private String fuelType;
    private String transmission;
    private Integer seatingCapacity;
    private Double price;
    private Double mileage;
    private Integer engineCc;
    private Double powerBhp;
    private Double torqueNm;
    private Integer safetyRating;
    private Integer bootSpace;
    private Integer groundClearance;
    private Boolean sunroof;
    private Boolean adas;
    private Integer airbags;
    private Boolean abs;
    private Boolean esc;
    private Boolean cruiseControl;
    private Boolean touchScreen;
    private Boolean alloyWheel;
    private Double rating;
    private String imageUrl;

    public static CarDto fromEntity(Car car) {
        if (car == null) return null;
        return CarDto.builder()
                .id(car.getId())
                .brand(car.getBrand())
                .model(car.getModel())
                .varient(car.getVarient())
                .bodyType(car.getBodyType())
                .fuelType(car.getFuelType())
                .transmission(car.getTransmission())
                .seatingCapacity(car.getSeatingCapacity())
                .price(car.getPrice())
                .mileage(car.getMileag())
                .engineCc(car.getEngineCc())
                .powerBhp(car.getPowerBhp())
                .torqueNm(car.getTorqueNm())
                .safetyRating(car.getSafetyRating())
                .bootSpace(car.getBootSpace())
                .groundClearance(car.getGroundClearance())
                .sunroof(car.getSunroof())
                .adas(car.getAdas())
                .airbags(car.getAirbags())
                .abs(car.getAbs())
                .esc(car.getEsc())
                .cruiseControl(car.getCruiseControl())
                .touchScreen(car.getTouchScreen())
                .alloyWheel(car.getAlloyWheel())
                .rating(car.getRating())
                .imageUrl(car.getImageUrl())
                .build();
    }
}
