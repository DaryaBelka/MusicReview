function showLoginForm() {
    toggleFormVisibility('login-form', 'register-form', 'Zaloguj się');
}

function showRegisterForm() {
    clearRegisterForm();
    toggleFormVisibility('register-form', 'login-form', 'Zarejestruj się');
}

function showSearchSection() {
    document.getElementById('artist_name').value = '';
    document.getElementById('result').innerHTML = '';
    toggleSectionVisibility('main-section', 'search-section');
}

function showReviewsSection() {
    toggleSectionVisibility('main-section', 'reviews-section');
}

function showMainSection() {
    toggleSectionVisibility('search-section', 'main-section');
    toggleSectionVisibility('reviews-section', 'main-section');
    toggleSectionVisibility('auth-section', 'main-section');
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

    //localStorage 
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
    showMainSection();
}

function updateUI() {
    const username = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const authButton = document.getElementById('auth-button');
    const logoutButton = document.getElementById('logout-button');

    if (isLoggedIn && username) {
        authButton.textContent = `${username}`;
        authButton.onclick = null;
        logoutButton.style.display = 'inline-block';
    } else {
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

    const table = document.getElementById("reviews-table");
    const row = table.insertRow();
    row.insertCell(0).textContent = artist;
    row.insertCell(1).textContent = rating;
    row.insertCell(2).textContent = comment;

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

document.addEventListener('DOMContentLoaded', updateUI);

async function searchArtist() {
    const artistName = document.getElementById("artist_name").value;

    if (!artistName) {
        alert('Proszę wpisać nazwisko artysty.');
        return;
    }

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = '';

    const token = await getAccessToken("c79abbb42a6845408fc3559cd72de370", "bcc5aefb75344308ad50c79f8f4cab65");

    if (token) {
        const songs = await getTopSongsByArtist(token, artistName);
        displaySongs(songs);
    } else {
        alert('Błąd autoryzacji Spotify.');
    }
}

// Spotify
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
        console.error('Ошибка при получении токена:', response.status);
        return null;
    }
}

// popularne piosenki
async function getTopSongsByArtist(token, artistName) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const artistData = await response.json();
    const artist = artistData.artists.items[0];

    if (artist) {
        const topTracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?country=US`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const topTracksData = await topTracksResponse.json();
        return topTracksData.tracks.map(track => track.name);
    } else {
        alert('Nie znaleziono artysty.');
        return [];
    }
}

function displaySongs(songs) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = songs.length === 0 ? "Brak utworów dla tego artysty." :
        `<ul>${songs.map(song => `<li>${song}</li>`).join('')}</ul>`;
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
