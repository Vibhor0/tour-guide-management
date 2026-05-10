package com.examly.springapp.exception;

public class UserException extends Exception
{
    public UserException(String message) {
        super(message);
    }

    public UserException(String message, Throwable ex) {
        super(message, ex);
    }
}
