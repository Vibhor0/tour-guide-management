package com.examly.springapp.dto;

public class PlaceRequest {
    private String name;
    private String category;
    private String bestTimeToVisit;
    private String placeImage;
    private String location;

    public PlaceRequest() {
    }

    public PlaceRequest(String name, String category, String bestTimeToVisit, String placeImage, String location) {
        this.name = name;
        this.category = category;
        this.bestTimeToVisit = bestTimeToVisit;
        this.placeImage = placeImage;
        this.location = location;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBestTimeToVisit() {
        return bestTimeToVisit;
    }

    public void setBestTimeToVisit(String bestTimeToVisit) {
        this.bestTimeToVisit = bestTimeToVisit;
    }

    public String getPlaceImage() {
        return placeImage;
    }

    public void setPlaceImage(String placeImage) {
        this.placeImage = placeImage;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

}
