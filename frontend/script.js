let currentUser = null;
let selectedMovie = null;

// 🟢 Backend Base URL
const BASE_URL = 'http://localhost:8080/api';

/* ---------- UI TOGGLE ---------- */
function showRegister() {
    document.getElementById('register').style.display = 'block';
    document.getElementById('login').style.display = 'none';
}

function showLogin() {
    document.getElementById('login').style.display = 'block';
    document.getElementById('register').style.display = 'none';
}

/* ---------- REGISTER ---------- */
async function register() {
    const user = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPass').value
    };

    if (!user.name || !user.email || !user.password) {
        alert("Please fill all registration fields.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (res.ok) {
            alert('Registration Successful! Please login now.');
            showLogin();
        } else {
            const data = await res.json().catch(() => ({}));
            alert('Registration Failed: ' + (data.message || 'Email might already exist.'));
        }
    } catch (error) {
        console.error("Error:", error);
        alert('Could not connect to the server. Please check if your backend is running.');
    }
}

/* ---------- LOGIN ---------- */
async function login() {
    const user = {
        email: document.getElementById('logEmail').value,
        password: document.getElementById('logPass').value
    };

    if (!user.email || !user.password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (res.ok) {
            currentUser = await res.json();
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            document.getElementById('auth').style.display = 'none';
            document.getElementById('login').style.display = 'none';
            document.getElementById('register').style.display = 'none';
            
            alert('Login successful! Loading movies...');
            loadMovies();
        } else {
            const data = await res.json().catch(() => ({}));
            alert('Login Failed: ' + (data.message || 'Invalid email or password.'));
        }
    } catch (error) {
        console.error("Error:", error);
        alert('Server connection error. Ensure your Spring Boot backend is active.');
    }
}

/* ---------- LOGOUT ---------- */
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedMovie');
    alert('You have been logged out.');
    window.location.href = 'indx.html';
}

/* ---------- LOAD MOVIES ---------- */
async function loadMovies() {
    try {
        const res = await fetch(`${BASE_URL}/movies`);
        let movies = [];
        
        if (res.ok) {
            movies = await res.json();
        }

        // 🟢 Fallback Logic: If DB is empty, show these movies for testing
        if (movies.length === 0) {
            movies = [
                { id: 101, movieName: "The Dark Knight", showTime: "2025-12-25T18:00:00", price: 250 },
                { id: 102, movieName: "Avatar: The Way of Water", showTime: "2025-12-25T21:00:00", price: 350 },
                { id: 103, movieName: "Interstellar", showTime: "2025-12-26T15:00:00", price: 200 }
            ];
        }

        const list = document.getElementById('movieList');
        if (!list) return;
        list.innerHTML = '';

        movies.forEach(movie => {
            const movieDate = new Date(movie.showTime).toLocaleString();
            const li = document.createElement('li');
            li.style.border = "1px solid #ddd";
            li.style.padding = "15px";
            li.style.margin = "10px 0";
            li.style.borderRadius = "8px";
            li.style.backgroundColor = "#fff";
            li.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";

            li.innerHTML = `
                <div style="display:flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size: 1.2em; color: #333;">${movie.movieName}</strong><br>
                        <small style="color: #666;">Date & Time: ${movieDate}</small><br>
                        <span style="color: #28a745; font-weight: bold;">Base Price: ₹${movie.price}</span>
                    </div>
                    <button style="background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;" 
                        onclick="selectMovie(${movie.id}, '${movie.movieName}', '${movie.showTime}', ${movie.price})">
                        Book Tickets
                    </button>
                </div>
            `;
            list.appendChild(li);
        });

        document.getElementById('movies').style.display = 'block';
    } catch (error) {
        console.error("Error loading movies:", error);
        // If server is down, show dummy movies anyway so UI doesn't look empty
        loadDummyMovies();
    }
}

function loadDummyMovies() {
    const list = document.getElementById('movieList');
    if (!list) return;
    const dummy = [
        { id: 101, movieName: "The Dark Knight (Demo)", showTime: "2025-12-25T18:00:00", price: 250 },
        { id: 102, movieName: "Avatar (Demo)", showTime: "2025-12-25T21:00:00", price: 350 }
    ];
    list.innerHTML = '';
    dummy.forEach(movie => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${movie.movieName}</strong> - ₹${movie.price} <button onclick="selectMovie(${movie.id}, '${movie.movieName}', '${movie.showTime}', ${movie.price})">Book</button>`;
        list.appendChild(li);
    });
    document.getElementById('movies').style.display = 'block';
}

/* ---------- SELECT MOVIE ---------- */
function selectMovie(id, name, time, price) {
    selectedMovie = { id, name, time, price };
    localStorage.setItem('selectedMovie', JSON.stringify(selectedMovie));
    window.location.href = 'booking.html';
}

/* ---------- PAGE LOAD LOGIC ---------- */
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }

    if (window.location.pathname.includes('booking.html')) {
        selectedMovie = JSON.parse(localStorage.getItem('selectedMovie'));
        
        if (!selectedMovie || !currentUser) {
            alert('Session expired. Please login again.');
            window.location.href = 'indx.html';
            return;
        }

        document.getElementById('movieName').textContent = selectedMovie.name;
        document.getElementById('showTime').textContent = new Date(selectedMovie.time).toLocaleString();
        
        // Add Category Dropdown if not present
        if (!document.getElementById('ticketCategory')) {
            const seatsLabel = document.getElementById('seats');
            const categoryDiv = document.createElement('div');
            categoryDiv.style.margin = "15px 0";
            categoryDiv.innerHTML = `
                <label style="font-weight:bold">Ticket Type: </label>
                <select id="ticketCategory" onchange="calculateTotal()" style="padding: 8px; border-radius: 4px;">
                    <option value="normal">Normal (Standard Seat)</option>
                    <option value="premium">Premium (Recliner + Popcorn + Soda) [+₹150]</option>
                </select>
            `;
            seatsLabel.parentNode.insertBefore(categoryDiv, seatsLabel);
        }

        document.getElementById('seats').addEventListener('input', calculateTotal);
        calculateTotal();
    }

    if (window.location.pathname.includes('confirmation.html')) {
        const movie = JSON.parse(localStorage.getItem('selectedMovie'));
        const finalBill = localStorage.getItem('lastBookingTotal');
        const detailsEl = document.getElementById('confirmationDetails');
        
        if (detailsEl && movie && finalBill) {
            detailsEl.innerHTML = `
                <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; border-left: 5px solid #007bff;">
                    <h2 style="color: #007bff; margin-top:0;">✔ Booking Confirmed!</h2>
                    <p>Movie: <strong>${movie.name}</strong></p>
                    <p>Total Paid: <span style="font-size: 1.2em; font-weight:bold; color: #28a745;">₹${finalBill}</span></p>
                    <p style="font-style: italic; color: #555;">Show this message at the counter. Enjoy your popcorn!</p>
                </div>
            `;
        }
    }
};

/* ---------- CALCULATE TOTAL ---------- */
function calculateTotal() {
    const seatsInput = document.getElementById('seats');
    const seats = parseInt(seatsInput.value) || 0;
    const category = document.getElementById('ticketCategory')?.value || 'normal';
    const totalDisplay = document.getElementById('total');
    const priceDisplay = document.getElementById('price');

    if (selectedMovie && totalDisplay) {
        let basePrice = selectedMovie.price;
        let extra = (category === 'premium') ? 150 : 0;
        let finalUnitPrice = basePrice + extra;

        if (priceDisplay) priceDisplay.textContent = finalUnitPrice;
        const total = seats * finalUnitPrice;
        totalDisplay.textContent = total;
        localStorage.setItem('lastBookingTotal', total);
    }
}

/* ---------- BOOK TICKET (PAY) ---------- */
async function bookTicket() {
    const seatsInput = document.getElementById('seats');
    const seats = parseInt(seatsInput.value);

    if (isNaN(seats) || seats <= 0) {
        alert('Please enter number of tickets.');
        return;
    }

    const booking = {
        userId: currentUser.id,
        movieId: selectedMovie.id,
        seats: seats
    };

    try {
        const res = await fetch(`${BASE_URL}/book-ticket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        });

        if (res.ok) {
            alert('Booking Confirmed! Payment Received.');
            window.location.href = 'confirmation.html';
        } else {
            // Handle specific error when movie ID is not in DB
            if (res.status === 400 && selectedMovie.id >= 100) {
                alert("BOOKING SIMULATED: This is a demo movie (not in DB). Proceeding to confirmation...");
                window.location.href = 'confirmation.html';
            } else {
                const data = await res.json().catch(() => ({}));
                alert('Payment Failed: ' + (data.message || 'Movie ID not found in database. Please add this movie to your MySQL first.'));
            }
        }
    } catch (error) {
        console.error("Error booking:", error);
        alert('Could not complete booking. Please ensure your Spring Boot app is running.');
    }
}