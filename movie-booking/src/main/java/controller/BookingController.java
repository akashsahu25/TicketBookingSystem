package controller;

import entity.Booking;
import service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping("/book-ticket")
    public ResponseEntity<Booking> bookTicket(@RequestBody Booking booking) {
        Booking savedBooking = bookingService.bookTicket(booking);
        if (savedBooking != null) {
            return ResponseEntity.ok(savedBooking);
        }
        return ResponseEntity.badRequest().build();
    }
}