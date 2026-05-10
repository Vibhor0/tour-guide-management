package com.examly.springapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int placeId;
    private String name;
    private String category;
    private String bestTimeToVisit;
    @Lob
    @Column(name="image",nullable = false, columnDefinition = "LONGBLOB")
    private String placeImage;
    private String location;
    public Place() {
    }
    public Place(int placeId, String name, String category, String bestTimeToVisit, String placeImage,
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
    @Override
    public String toString() {
        return "Place [placeId=" + placeId + ", name=" + name + ", category=" + category + ", bestTimeToVisit="
                + bestTimeToVisit + ", placeImage=" + placeImage + ", location=" + location + "]";
    }

    

}
