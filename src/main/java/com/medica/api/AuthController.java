package com.medica.api;

import com.medica.auth.AuthService;
import com.medica.auth.RegistrationService;
import com.medica.model.AuthSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService = new AuthService();
    private final RegistrationService registrationService = new RegistrationService();

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        if (email == null || password == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password required"));

        AuthSession session = authService.loginUser(email, password);
        if (session == null)
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));

        return ResponseEntity.ok(Map.of(
            "role", session.getRole().getValue(),
            "id",   session.getUser().getId(),
            "name", session.getUser().getName(),
            "email",session.getUser().getEmail()
        ));
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name            = body.get("name");
        String age             = body.get("age");
        String bloodGroup      = body.get("bloodGroup");
        String gender          = body.get("gender");
        String email           = body.get("email");
        String phone           = body.get("phone");
        String password        = body.get("password");
        String confirmPassword = body.get("confirmPassword");

        Map<String, String> errors = registrationService.validateForm(
            name, age, bloodGroup, gender, email, phone, password, confirmPassword
        );
        if (!errors.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("errors", errors));

        if (authService.checkEmailExists(email))
            return ResponseEntity.badRequest().body(Map.of("errors",
                Map.of("email", "Email already registered in the system")));

        String error = registrationService.registerPatient(
            name, Integer.parseInt(age.trim()), bloodGroup, gender, email, phone, password
        );
        if (error != null)
            return ResponseEntity.internalServerError().body(Map.of("error", error));

        return ResponseEntity.ok(Map.of("message", "Account created successfully"));
    }
}
