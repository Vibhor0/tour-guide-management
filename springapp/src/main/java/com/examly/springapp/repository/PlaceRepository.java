package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.Place;

@Repository
public interface PlaceRepository extends JpaRepository<Place,Integer> {

   public Boolean existsByNameIgnoreCase(String name);
}
