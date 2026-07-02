package com.acrdekho.carrec.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Car {
    private String id;
    private String brand;
    private String model;
    private String varient; // exact spelling requested ("varient")
    
    @JsonProperty("bodytype")
    private String bodyType;
    
    @JsonProperty("fueltype")
    private String fuelType;
    
    private String transmission;
    
    @JsonProperty("seatingcapacity")
    private Integer seatingCapacity;
    
    private Double price;
    private Double mileag; // exact spelling requested ("mileag")
    
    @JsonProperty("enginecc")
    private Integer engineCc;
    
    @JsonProperty("powerbhp")
    private Double powerBhp;
    
    @JsonProperty("torquenm")
    private Double torqueNm;
    
    private Integer safetyRating;
    
    @JsonProperty("bootspace")
    private Integer bootSpace;
    
    @JsonProperty("groundclearance")
    private Integer groundClearance;
    
    private Boolean sunroof;
    private Boolean adas;
    private Integer airbags;
    private Boolean abs;
    private Boolean esc;
    
    @JsonProperty("cruisecontrol")
    private Boolean cruiseControl;
    
    @JsonProperty("touchsreen")
    private Boolean touchScreen; // exact spelling requested ("touchsreen")
    
    @JsonProperty("alloywheel")
    private Boolean alloyWheel;
    
    private Double rating;
    
    @JsonProperty("imageurl")
    private String imageUrl;
    
    @JsonProperty("isActive")
    private Boolean isActive;
}
