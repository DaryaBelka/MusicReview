
        // Funkcja do przełączania widoku do sekcji wyszukiwania piosenek
        function showSearchSection() {
            document.getElementById('main-section').classList.add('hidden');
            document.getElementById('search-section').classList.remove('hidden');
        }

        // Funkcja do przełączania widoku do sekcji opinii
        function showReviewsSection() {
            document.getElementById('main-section').classList.add('hidden');
            document.getElementById('reviews-section').classList.remove('hidden');
        }

        // Funkcja powrotu do głównego widoku
        function showMainSection() {
            document.getElementById('search-section').classList.add('hidden');
            document.getElementById('reviews-section').classList.add('hidden');
            document.getElementById('main-section').classList.remove('hidden');
        }

        // Funkcja dodająca opinię do tabeli
        function addReview() {
            const artist = document.getElementById("track").value;
            const rating = document.getElementById("rating").value;
            const comment = document.getElementById("comment").value;
            const isPublic = document.getElementById("public-status").checked ? "Publiczna" : "Prywatna";

            if (!artist || !rating || !comment) {
                alert("Wszystkie pola muszą być wypełnione.");
                return;
            }

            // Dodanie nowego wiersza do tabeli
            const table = document.getElementById("reviews-table");
            const row = table.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);

            cell1.textContent = artist;
            cell2.textContent = rating;
            cell3.textContent = comment;

            // Czyszczenie pól formularza
            document.getElementById("track").value = "";
            document.getElementById("rating").value = "";
            document.getElementById("comment").value = "";
            document.getElementById("public-status").checked = true;  // Domyślnie publiczny

            alert("Recenzja została dodana!");
            showMainSection();  // Powrót na stronę główną
        }

        // Funkcja aktualizująca podgląd recenzji
        function updatePreview() {
            const track = document.getElementById("track").value;
            const rating = document.getElementById("rating").value;
            const comment = document.getElementById("comment").value;
            const isPublic = document.getElementById("public-status").checked ? "Publiczna" : "Prywatna";

            document.getElementById("preview-track").textContent = track || "Nie wybrano";
            document.getElementById("preview-rating").textContent = rating || "Brak oceny";
            document.getElementById("preview-comment").textContent = comment || "Brak komentarza";
            document.getElementById("preview-status").textContent = isPublic;
            
            // Aktualizacja liczby pozostałych znaków w komentarzu
            const remainingChars = 500 - comment.length;
            document.getElementById("char-count").textContent = `Pozostało znaków: ${remainingChars}`;
        }

        // Funkcja wyszukiwania artysty
    async function searchArtist() {
        const artistName = document.getElementById("artist_name").value;
        const clientId = "c79abbb42a6845408fc3559cd72de370";
        const clientSecret = "bcc5aefb75344308ad50c79f8f4cab65";

        // Uzyskanie tokenu dostępu
        const token = await getAccessToken(clientId, clientSecret);
            
        if (token) {
            const songs = await getTopSongsByArtist(token, artistName);
            displaySongs(songs);
        } else {
            alert('Failed to authenticate with Spotify.');
        }
    }

    // Funkcja uzyskująca token dostępu z Spotify
    async function getAccessToken(clientId, clientSecret) {
        const authString = `${clientId}:${clientSecret}`;
        const authBase64 = btoa(authString);  // Kodowanie w base64

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
            console.error('Error getting access token:', response.status);
            return null;
        }
    }

    // Funkcja pobierająca top utwory artysty
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
            const artistId = artist.id;
            const topTracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const topTracksData = await topTracksResponse.json();
            return topTracksData.tracks.map(track => track.name);
        } else {
            alert('No artist found with that name.');
            return [];
        }
    }

    // Funkcja wyświetlająca listę utworów na stronie
    function displaySongs(songs) {
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = "";

        if (songs.length === 0) {
            resultDiv.innerHTML = "No songs found for this artist.";
        } else {
            const ul = document.createElement("ul");
            songs.forEach(song => {
                const li = document.createElement("li");
                li.textContent = song;
                ul.appendChild(li);
            });
            resultDiv.appendChild(ul);
        }
    }