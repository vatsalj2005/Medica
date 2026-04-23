package com.medica.api;

import com.medica.service.AppointmentSchedulingFacade;
import com.medica.service.ReceptionistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/receptionist")
public class ReceptionistController {

    private final ReceptionistService receptionistService = new ReceptionistService();
    private final AppointmentSchedulingFacade schedulingFacade = new AppointmentSchedulingFacade();

    // GET /api/receptionist/dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        try {
            return ResponseEntity.ok(Map.of(
                "pending",       receptionistService.getPendingRequestCount(),
                "today",         receptionistService.getTodayAppointmentCount(),
                "weekCompleted", receptionistService.getWeekCompletedCount(),
                "recentRequests",receptionistService.getRecentRequests()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/receptionist/requests
    @GetMapping("/requests")
    public ResponseEntity<?> requests() {
        try {
            return ResponseEntity.ok(receptionistService.getAllRequests());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/receptionist/requests/schedule
    @PostMapping("/requests/schedule")
    public ResponseEntity<?> schedule(@RequestBody Map<String, String> body) {
        try {
            String patientId = body.get("patientId");
            String doctorId  = body.get("doctorId");
            LocalDate date   = LocalDate.parse(body.get("date"));
            LocalTime start  = LocalTime.parse(body.get("startTime"));
            LocalTime end    = LocalTime.parse(body.get("endTime"));

            String error = schedulingFacade.scheduleAppointment(patientId, doctorId, date, start, end);
            if (error != null)
                return ResponseEntity.badRequest().body(Map.of("error", error));

            return ResponseEntity.ok(Map.of("message", "Appointment scheduled successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/receptionist/appointments
    @GetMapping("/appointments")
    public ResponseEntity<?> appointments(@RequestParam(required = false) String status,
                                           @RequestParam(required = false) String date) {
        try {
            var all = receptionistService.getAllAppointments();
            var filtered = receptionistService.filterAppointments(all, status, date);
            return ResponseEntity.ok(filtered);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/receptionist/appointments/{id}/cancel
    @PostMapping("/appointments/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable String id) {
        String error = receptionistService.cancelAppointment(id);
        if (error != null)
            return ResponseEntity.badRequest().body(Map.of("error", error));
        return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully"));
    }
}
