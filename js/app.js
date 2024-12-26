function showLoginForm() {
    toggleFormVisibility('login-form', 'register-form', 'Zaloguj się');
}

function showRegisterForm() {
    clearRegisterForm();
    toggleFormVisibility('register-form', 'login-form', 'Zarejestruj się');
}

function showPlaylistSection() {
    toggleSectionVisibility('main-section', 'playlist-section');
}

function showReviewsSection() {
    toggleSectionVisibility('main-section', 'reviews-section');
}

function showMainSection() {
    toggleSectionVisibility('playlist-section', 'main-section');
    toggleSectionVisibility('reviews-section', 'main-section');
    toggleSectionVisibility('auth-section', 'main-section');
    document.getElementById('welcome-section').classList.add('hidden');
}

function showAuthSection() {
    toggleSectionVisibility('main-section', 'auth-section');
    showLoginForm();
}

function clearAuthForms() {
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

function clearRegisterForm() {
    document.getElementById('register-username').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm-password').value = '';
}

function loginUser() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (username === storedUsername && password === storedPassword) {
        alert('Zalogowano pomyślnie!');
        localStorage.setItem('loggedIn', 'true');
        updateUI();
        clearAuthForms();
        showMainSection();
    } else {
        alert('Błędna nazwa użytkownika lub hasło.');
    }
}

function registerUser() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Hasła muszą być takie same.');
        return;
    }

    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('loggedIn', 'true');

    alert('Rejestracja zakończona sukcesem! Zalogowano automatycznie.');
    updateUI();
    clearRegisterForm();
    showMainSection();
}

function logout() {
    localStorage.removeItem('loggedIn');
    updateUI();
    clearAuthForms();
    showWelcomeSection();
}

function updateUI() {
    const username = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const welcomeSection = document.getElementById('welcome-section');
    const mainSection = document.getElementById('main-section');
    const authButton = document.getElementById('auth-button');
    const logoutButton = document.getElementById('logout-button');

    if (isLoggedIn && username) {
        welcomeSection.classList.add('hidden');
        mainSection.classList.remove('hidden');
        authButton.textContent = `${username}`;
        authButton.onclick = null;
        logoutButton.style.display = 'inline-block';
    } else {
        welcomeSection.classList.remove('hidden');
        mainSection.classList.add('hidden');
        authButton.textContent = 'Zaloguj się / Zarejestruj się';
        authButton.onclick = showAuthSection;
        logoutButton.style.display = 'none';
    }
}

function addReview() {
    const artist = document.getElementById("track").value;
    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;

    if (!artist || !rating || !comment) {
        alert("Wszystkie pola muszą być wypełnione.");
        return;
    }

    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];

    const newReview = {
        artist: artist,
        rating: rating,
        comment: comment
    };

    reviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    displayReviews();

    document.getElementById("track").value = "";
    document.getElementById("rating").value = "";
    document.getElementById("comment").value = "";

    alert("Recenzja została dodana!");
    showMainSection();
}

function updatePreview() {
    const track = document.getElementById("track").value;
    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;
    const isPublic = document.getElementById("public-status").checked ? "Publiczna" : "Prywatna";

    document.getElementById("preview-track").textContent = track || "Nie wybrano";
    document.getElementById("preview-rating").textContent = rating || "Brak oceny";
    document.getElementById("preview-comment").textContent = comment || "Brak komentarza";
    document.getElementById("preview-status").textContent = isPublic;
    document.getElementById("char-count").textContent = `Pozostało znaków: ${500 - comment.length}`;
}

function displayReviews() {
    const reviewsTable = document.getElementById("reviews-table");

    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];

    reviewsTable.innerHTML = `
        <thead>
            <tr>
                <th>Artyści</th>
                <th>Ocena</th>
                <th>Komentarz</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = reviewsTable.getElementsByTagName('tbody')[0];

    reviews.forEach(review => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = review.artist;
        row.insertCell(1).textContent = review.rating;
        row.insertCell(2).textContent = review.comment;
    });
}

function toggleSectionVisibility(hideSection, showSection) {
    document.getElementById(hideSection).classList.add('hidden');
    document.getElementById(showSection).classList.remove('hidden');
}

function toggleFormVisibility(showForm, hideForm, headerText) {
    document.getElementById(hideForm).classList.add('hidden');
    document.getElementById(showForm).classList.remove('hidden');
    document.getElementById('auth-header').textContent = headerText;
}

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    displayReviews(); 
});

// Funkcja do uzyskania tokenu dostępu z API Spotify
async function getAccessToken(clientId, clientSecret) {
    const authString = `${clientId}:${clientSecret}`;
    const authBase64 = btoa(authString);

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authBase64}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (response.ok) {
        const data = await response.json();
        return data.access_token;
    } else {
        console.error('Błąd podczas uzyskiwania tokenu:', response.status, response.statusText);
        return null;
    }
}

// Funkcja do wyszukiwania utworów na podstawie gatunku i nastroju
async function displaySongsByGenre() {
    const genre = document.getElementById("genre").value;
    const numSongs = parseInt(document.getElementById("num-songs").value);
    const mood = document.getElementById("mood").value;
    const playlistName = document.getElementById("playlist-name").value;

    if (!genre || !numSongs || numSongs <= 0) {
        alert('Proszę wybrać gatunek i liczbę piosenek.');
        return;
    }

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = '';  // Wyczyść poprzednią listę utworów

    const token = await getAccessToken("c79abbb42a6845408fc3559cd72de370", "bcc5aefb75344308ad50c79f8f4cab65");

    if (token) {
        const songs = await getSongsByGenre(token, genre, numSongs, mood);
        displayPlaylistName(playlistName);
        displaySongs(songs);
    } else {
        alert('Błąd autoryzacji Spotify.');
    }
}

// Funkcja do pobrania utworów na podstawie gatunku i nastroju
async function getSongsByGenre(token, genre, numSongs, mood) {
    const query = `genre:${genre}${mood ? ` mood:${mood}` : ''}`;
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=${numSongs}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (data.tracks && data.tracks.items) {
        return data.tracks.items.map(track => ({
            name: track.name,
            artists: track.artists.map(artist => artist.name).join(', '),
            uri: track.uri
        }));
    } else {
        alert('Brak utworów w tym gatunku.');
        return [];
    }
}

// Funkcja do wyświetlania nazwy playlisty
function displayPlaylistName(name) {
    const playlistNameDiv = document.getElementById("playlist-name-display");
    if (name) {
        playlistNameDiv.innerHTML = `<h3>Twoja playlista: ${name}</h3>`;
    }
}

// Funkcja do wyświetlania utworów na stronie
function displaySongs(songs) {
    const resultDiv = document.getElementById("result");
    if (songs.length === 0) {
        resultDiv.innerHTML = "Brak utworów do wyświetlenia.";
    } else {
        resultDiv.innerHTML = `<ul>${songs.map(song => `<li><a href="https://open.spotify.com/track/${song.uri.split(":")[2]}" target="_blank">${song.name} - ${song.artists}</a></li>`).join('')}</ul>`;
    }
}

// Funkcja do generowania losowej playlisty
function surpriseMe() {
    const genres = ['pop', 'rock', 'jazz', 'hip-hop', 'classical', 'electronic'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];

    const moods = ['', 'happy', 'sad', 'party', 'calm', 'energetic'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];

    const randomNumSongs = Math.floor(Math.random() * 10) + 1;

    document.getElementById("genre").value = randomGenre;
    document.getElementById("mood").value = randomMood;
    document.getElementById("num-songs").value = randomNumSongs;

    displaySongsByGenre();
}




