package com.examly.springapp.service;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.dto.UserRequest;
import com.examly.springapp.dto.UserResponse;
import com.examly.springapp.exception.UserException;
import com.examly.springapp.mapper.UserMapper;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.utils.UserUtils;

@Service
public class UserService {
    @Value("${spring.security.oauth2.resourceserver.jwt.secret-key}")
    private String secretKey;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserMapper userMapper;

    @Transactional
    public UserResponse register(UserRequest req) throws UserException {
        System.out.println("=====================================");
        System.out.println(req.getUsername());
        System.out.println(userRepository.existsByUsername(req.getUsername()));
        System.out.println("=====================================");
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new UserException("Username already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new UserException("Email already registered");
        }
        User user = userRepository.save(userMapper.mapToEntity(req));
        return userMapper.mapToDto(user);
    }

    public LoginResponse login(LoginRequest req) throws UserException {
        try {
            User user = userRepository.findByUsername(req.getUsername());
            if (user != null && UserUtils.decrypt(user.getPassword()).equals(req.getPassword())) {

                String normalizedRole = user.getRole() == null
                        ? null
                        : user.getRole().trim().toUpperCase(Locale.ROOT); 

                LoginResponse res = new LoginResponse();
                res.setToken(UserUtils.generateToken(user.getUsername(), normalizedRole, secretKey));
                res.setUsername(user.getUsername());
                res.setRole(normalizedRole);

                return res;
            } else {
                throw new UserException("Invalid username or password");
            }
        } catch (Exception e) {
            throw new UserException("Error while processing login", e);
        }
    }

}
