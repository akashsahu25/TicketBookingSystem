package service;

import entity.Booking;
import entity.Movie;
import userRepository.BookingRepository;
import userRepository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private MovieRepository movieRepository;

    public Booking bookTicket(Booking booking) {

        Movie movie = movieRepository.findById(booking.getMovieId()).orElse(null);
        if (movie != null) {

            BigDecimal total = movie.getPrice().multiply(new BigDecimal(booking.getSeats()));
            booking.setTotalAmount(total);
            return bookingRepository.save(booking);
        }
        return null;
    }
}