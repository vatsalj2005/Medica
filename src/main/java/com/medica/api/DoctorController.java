package com.medica.api;

import com.medica.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final DoctorService doctorService = new DoctorService();

    // GET /api/doctor/{id}/dashboard
    @GetMapping("/{id}/dashboard")
    public ResponseEntity<?> dashboard(@PathVariable String id) {
        try {
            return ResponseEntity.ok(Map.of(
                "today",          doctorService.getTodayScheduledCount(id),
                "completed",      doctorService.getTotalCompletedCount(id),
                "uniquePatients", doctorService.getUniquePatientCount(id),
                "todaySchedule",  doctorService.getTodaySchedule(id)
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/doctor/{id}/appointments
    @GetMapping("/{id}/appointments")
    public ResponseEntity<?> appointments(@PathVariable String id) {
        try {
            return ResponseEntity.ok(doctorService.getAllAppointments(id));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/doctor/{id}/appointments/{appointmentId}/complete
    @PostMapping("/{id}/appointments/{appointmentId}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable String id,
                                                  @PathVariable String appointmentId,
                                                  @RequestBody Map<String, String> body) {
        List<String> errors = doctorService.validateCompletionForm(
            body.get("symptoms"), body.get("diagnosis"), body.get("prescription"),
            body.get("healthCondition"), body.get("treatment")
        );
        if (!errors.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("errors", errors));

        String error = doctorService.completeAppointment(
            appointmentId, body.get("patientId"), id,
            body.get("date"), body.get("symptoms"), body.get("diagnosis"),
            body.get("prescription"), body.get("healthCondition"),
            body.get("treatment"), body.get("type")
        );
        if (error != null)
            return ResponseEntity.internalServerError().body(Map.of("error", error));

        return ResponseEntity.ok(Map.of("message", "Appointment completed successfully"));
    }

    // GET /api/doctor/{id}/patients
    @GetMapping("/{id}/patients")
    public ResponseEntity<?> patients(@PathVariable String id) {
        try {
            return ResponseEntity.ok(doctorService.getMyPatients(id));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/doctor/{id}/patients/{patientId}
    @GetMapping("/{id}/patients/{patientId}")
    public ResponseEntity<?> patientDetail(@PathVariable String id, @PathVariable String patientId) {
        try {
            if (!doctorService.hasTreatedPatient(id, patientId))
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));

            var patient = doctorService.getPatientDetail(patientId);
            if (patient == null)
                return ResponseEntity.notFound().build();

            var history = doctorService.getPatientMedicalHistory(id, patientId);
            return ResponseEntity.ok(Map.of("patient", patient, "history", history));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
