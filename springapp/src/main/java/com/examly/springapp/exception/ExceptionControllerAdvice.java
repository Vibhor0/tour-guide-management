package com.examly.springapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class ExceptionControllerAdvice {

    @ExceptionHandler(PlaceException.class)

    public ResponseEntity<?> handlePlaceException(PlaceException e) {

        ErrorHandler error = new ErrorHandler(e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);

    }

    @ExceptionHandler(UserException.class)
    public ResponseEntity<ErrorHandler> populateResponseForUserException(UserException ex, WebRequest request) {
        ErrorHandler response = new ErrorHandler();
        response.setMessage(ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

}
