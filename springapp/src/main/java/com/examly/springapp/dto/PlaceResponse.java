package com.examly.springapp.dto;

public class PlaceResponse {
    private int placeId;
    private String name;
    private String category;
    private String bestTimeToVisit;
    private String placeImage;
    private String location;

    public PlaceResponse() {
    }

    public PlaceResponse(int placeId, String name, String category, String bestTimeToVisit, String placeImage,
            String location) {
        this.placeId = placeId;
        this.name = name;
        this.category = category;
        this.bestTimeToVisit = bestTimeToVisit;
        this.placeImage = placeImage;
        this.location = location;
    }

    public int getPlaceId() {
        return placeId;
    }

    public void setPlaceId(int placeId) {
        this.placeId = placeId;
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
