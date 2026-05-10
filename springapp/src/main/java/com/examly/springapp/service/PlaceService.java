package com.examly.springapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examly.springapp.exception.PlaceException;
import com.examly.springapp.mapper.PlaceMapper;
import com.examly.springapp.model.Place;
import com.examly.springapp.repository.PlaceRepository;
import com.examly.springapp.dto.PlaceRequest;
import com.examly.springapp.dto.PlaceResponse;

@Service
public class PlaceService {

  @Autowired
   private PlaceRepository placerepository;
    @Autowired
   private PlaceMapper placeMapper;

   public PlaceResponse addPlace(PlaceRequest place) throws PlaceException
   {
      if(placerepository.existsByNameIgnoreCase(place.getName()))
      {
        throw new PlaceException("Place with name "+place.getName()+" already exists");
      }

      Place saved=placerepository.save(placeMapper.mapToEntity(place));
      return placeMapper.mapToDto(saved);
    }

    public List<Place> getPlaces()
    { 
      List<Place> list =placerepository.findAll();
      return list;
    }

    public PlaceResponse getById(int id) throws PlaceException
    {

      if(placerepository.existsById(id))
      {
        Optional<Place> opt=placerepository.findById(id);
        Place p=opt.get();
        return placeMapper.mapToDto(p);
      }

      throw new PlaceException("Place not found with ID: "+id);
    }

    public PlaceResponse updatePlace(PlaceRequest place, int id) throws PlaceException
    {
       if(placerepository.existsById(id))
       {
        Place p = placeMapper.mapToEntity(place);
        p.setPlaceId(id);
        Place saved=placerepository.save(p);
        return placeMapper.mapToDto(saved);
       }

       throw new PlaceException("Cannot update. Place not found with ID: "+id);

    }
   public boolean deletePlaces(int id) throws PlaceException
   {
    boolean found = false;
    if(placerepository.existsById(id))
    {
      placerepository.deleteById(id);
      found = true;
    }

    else
    {
      throw new PlaceException("Failed to delete place");
    }
    return found;
   }
}
