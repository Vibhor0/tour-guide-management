package com.examly.springapp.mapper;

import org.springframework.stereotype.Component;

import com.examly.springapp.dto.PlaceRequest;
import com.examly.springapp.dto.PlaceResponse;
import com.examly.springapp.model.Place;

@Component
public class PlaceMapper {
    public Place mapToEntity(PlaceRequest req) {
        Place place = new Place();
        place.setName(req.getName());
        place.setCategory(req.getCategory());
        place.setBestTimeToVisit(req.getBestTimeToVisit());
        place.setPlaceImage(req.getPlaceImage());
        place.setLocation(req.getLocation());
        return place;
    }
    public PlaceResponse mapToDto(Place place) {
        PlaceResponse res = new PlaceResponse();
        res.setPlaceId(place.getPlaceId());
        res.setName(place.getName());
        res.setCategory(place.getCategory());
        res.setBestTimeToVisit(place.getBestTimeToVisit());
        res.setPlaceImage(place.getPlaceImage());
        res.setLocation(place.getLocation());
        return res;
    }
}
