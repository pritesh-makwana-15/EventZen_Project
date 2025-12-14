// ================================================================
// FILE 1: CreateVenueRequest.java
// ================================================================
package com.eventzen.dto.request;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

public class CreateVenueRequest {
    @NotBlank(message = "Venue name is required")
    private String name;

    private String address;
    private String city;
    private String state;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String mapData;
    private List<String> unavailableDates;
    private String imageUrl;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getMapData() {
        return mapData;
    }

    public void setMapData(String mapData) {
        this.mapData = mapData;
    }

    public List<String> getUnavailableDates() {
        return unavailableDates;
    }

    public void setUnavailableDates(List<String> unavailableDates) {
        this.unavailableDates = unavailableDates;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}