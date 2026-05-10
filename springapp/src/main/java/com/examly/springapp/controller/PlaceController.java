package com.examly.springapp.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.exception.PlaceException;
import com.examly.springapp.exception.UserException;
import com.examly.springapp.model.Place;
import com.examly.springapp.service.PlaceService;
import com.examly.springapp.service.UserService;
import com.examly.springapp.utils.UserUtils;
import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.dto.PlaceRequest;
import com.examly.springapp.dto.PlaceResponse;
import com.examly.springapp.dto.UserRequest;
import com.examly.springapp.dto.UserResponse;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api")

public class PlaceController {

    @Autowired
    private UserService userService;

    @Value("${spring.security.oauth2.resourceserver.jwt.secret-key}")
    private String secretKey;

    @Autowired
    private PlaceService placeService;

    @PostMapping("/places")
    public ResponseEntity<?> addNewPlaces(@RequestBody PlaceRequest place) throws PlaceException {
        PlaceResponse savedPlace = null;
        savedPlace = placeService.addPlace(place);
        return ResponseEntity.status(200).body(savedPlace);
    }

    @PostMapping(value = "/places", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create place (multipart)", description = "Multipart variant for Swagger/manual testing. Frontend can keep using the JSON endpoint.")
    public ResponseEntity<?> addNewPlacesMultipart(
            @RequestPart("name") String name,
            @RequestPart("category") String category,
            @RequestPart("bestTimeToVisit") String bestTimeToVisit,
            @RequestPart("location") String location,
            @RequestPart("placeImage") MultipartFile placeImageFile) throws PlaceException, IOException {

        String base64 = java.util.Base64.getEncoder().encodeToString(placeImageFile.getBytes());

        PlaceRequest place = new PlaceRequest();
        place.setName(name);
        place.setCategory(category);
        place.setBestTimeToVisit(bestTimeToVisit);
        place.setLocation(location);
        place.setPlaceImage(base64);

        PlaceResponse savedPlace = placeService.addPlace(place); // reuses existing flow
        return ResponseEntity.ok(savedPlace);
    }

    @GetMapping("/places")
    public ResponseEntity<?> getPlaces() {

        List<Place> listPlace = placeService.getPlaces();
        if (!listPlace.isEmpty()) {
            return ResponseEntity.status(200).body(listPlace);
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "Failed to load places"));
        }
    }

    @GetMapping("/places/{placeId}")
    public ResponseEntity<?> getPlaceById(@PathVariable int placeId) throws PlaceException {

        PlaceResponse list = placeService.getById(placeId);
        return ResponseEntity.status(200).body(list);

    }

    @PutMapping("/places/{placeId}")
    public ResponseEntity<?> updatePlaceById(@PathVariable int placeId, @RequestBody PlaceRequest place)
            throws PlaceException {
        PlaceResponse savedPlace = null;
        savedPlace = placeService.updatePlace(place, placeId);

        if (savedPlace == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Cannot find any place"));
        } else {
            return ResponseEntity.status(200).body(Map.of("message", "Place updated successfully"));
        }

    }

    @PutMapping(
        value = "/places/{placeId}",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
        summary = "Update place (multipart)",
        description = "Multipart variant for Swagger/manual testing."
    )
    public ResponseEntity<?> updatePlaceByIdMultipart(
            @PathVariable int placeId,
            @RequestPart("name") String name,
            @RequestPart("category") String category,
            @RequestPart("bestTimeToVisit") String bestTimeToVisit,
            @RequestPart("location") String location,
            @RequestPart("placeImage") MultipartFile placeImageFile
    ) throws PlaceException, IOException {
    
        String base64 = java.util.Base64.getEncoder().encodeToString(placeImageFile.getBytes());
    
        PlaceRequest place = new PlaceRequest();
        place.setName(name);
        place.setCategory(category);
        place.setBestTimeToVisit(bestTimeToVisit);
        place.setLocation(location);
        place.setPlaceImage(base64);
    
        PlaceResponse savedPlace = placeService.updatePlace(place, placeId); // reuses existing flow
    
        if (savedPlace == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Cannot find any place"));
        } else {
            return ResponseEntity.ok(Map.of("message", "Place updated successfully"));
        }
    }

    @DeleteMapping("/places/{placeId}")
    public ResponseEntity<?> deletePlacesById(@PathVariable int placeId) throws PlaceException {

        if (placeService.deletePlaces(placeId)) {
            return ResponseEntity.status(200).body(Map.of("message", "Place deleted successfully"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Cannot find any place"));

    }

    @PostMapping("/user/register")
    public ResponseEntity<UserResponse> register(@RequestBody UserRequest userRequest) throws UserException {
        return ResponseEntity.ok(userService.register(userRequest));
    }

    @PostMapping("/user/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) throws UserException {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/user/token/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String bearerToken) {
        return ResponseEntity.ok(UserUtils.isTokenValid(bearerToken, secretKey));
    }

}
