package com.medica.api;

import com.medica.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    private final PatientService patientService = new PatientService();

    // GET /api/patient/{id}/dashboard
    @GetMapping("/{id}/dashboard")
    public ResponseEntity<?> dashboard(@PathVariable String id) {
        try {
            return ResponseEntity.ok(Map.of(
                "upcoming",   patientService.getUpcomingCount(id),
                "pending",    patientService.getPendingRequestCount(id),
                "total",      patientService.getCompletedCount(id),
                "upcomingAppointments", patientService.getUpcomingAppointments(id),
                "pendingRequests",      patientService.getPendingRequests(id)
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/patient/{id}/appointments
    @GetMapping("/{id}/appointments")
    public ResponseEntity<?> appointments(@PathVariable String id) {
        try {
            return ResponseEntity.ok(patientService.getAllAppointments(id));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/patient/appointments/{appointmentId}/summary
    @GetMapping("/appointments/{appointmentId}/summary")
    public ResponseEntity<?> summary(@PathVariable String appointmentId) {
        try {
            var summary = patientService.getAppointmentSummary(appointmentId);
            if (summary == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/patient/doctors
    @GetMapping("/doctors")
    public ResponseEntity<?> doctors() {
        try {
            return ResponseEntity.ok(patientService.getAllDoctors());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/patient/{id}/request-status/{doctorId}
    @GetMapping("/{id}/request-status/{doctorId}")
    public ResponseEntity<?> requestStatus(@PathVariable String id, @PathVariable String doctorId) {
        try {
            return ResponseEntity.ok(Map.of("status", patientService.getRequestStatus(id, doctorId)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/patient/{id}/request/{doctorId}
    @PostMapping("/{id}/request/{doctorId}")
    public ResponseEntity<?> requestAppointment(@PathVariable String id, @PathVariable String doctorId) {
        String error = patientService.requestAppointment(id, doctorId);
        if (error != null)
            return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.ok(Map.of("message", "Request sent successfully"));
    }

    // GET /api/patient/{id}/medical-history
    @GetMapping("/{id}/medical-history")
    public ResponseEntity<?> medicalHistory(@PathVariable String id,
                                             @RequestParam(required = false) String search) {
        try {
            var records = patientService.getMedicalHistory(id);
            if (search != null && !search.isBlank())
                records = patientService.filterByCondition(records, search);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
