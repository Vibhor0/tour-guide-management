package com.examly.springapp.mapper;

import org.springframework.stereotype.Component;

import com.examly.springapp.dto.UserRequest;
import com.examly.springapp.dto.UserResponse;
import com.examly.springapp.model.User;
import com.examly.springapp.utils.UserUtils;
 
@Component
public class UserMapper {

    public User mapToEntity(UserRequest dto) {
        User entity = new User();
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());
        entity.setPassword(UserUtils.encrypt(dto.getPassword()));
        entity.setRole(dto.getRole());
        return entity;
    }

    public UserResponse mapToDto(User entity) {
        UserResponse dto = new UserResponse();
        dto.setId(entity.getId());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setUsername(entity.getUsername());
        dto.setEmail(entity.getEmail());
        dto.setRole(entity.getRole());
        return dto;
    }
}
