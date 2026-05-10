package com.examly.springapp.exception;

public class ErrorHandler {
private String message;

public ErrorHandler() {
}

public ErrorHandler(String message) {
    this.message = message;
}

public String getMessage() {
    return message;
}

public void setMessage(String message) {
    this.message = message;
}

@Override
public String toString() {
    return "ErrorHandler [message=" + message + "]";
}

}
