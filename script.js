
const defaultBooks = [
    {
        id: 1,
        title: "Atomic Habits",
        author: "James Clear",
        genre: "Self-growth",
        image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        copies: 5
    },
    {
        id: 2,
        title: "The Alchemist",
        author: "Paulo Coelho",
        genre: "Fiction",
        image: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
        copies: 5
    },
    {
        id: 3,
        title: "Harry Potter",
        author: "J.K. Rowling",
        genre: "Fantasy",
        image: "https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg",
        copies: 5
    },
    {
        id: 4,
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        genre: "Science",
        image: "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg",
        copies: 5
    },
    {
        id: 5,
        title: "Steve Jobs",
        author: "Walter Isaacson",
        genre: "Biography",
        image: "https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg",
        copies: 5
    },
    {
        id: 6,
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        genre: "Self-growth",
        image: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",
        copies: 5
    },
    {
        id: 7,
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        image: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
        copies: 5
    },
    {
        id: 8,
        title: "The Psychology of Money",
        author: "Morgan Housel",
        genre: "Fiction",
        image: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
        copies: 5
    }
];

function loadData(key, fallback) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data === null ? fallback : data;
    } catch {
        return fallback;
    }
}

let books = loadData("libraryBooks", defaultBooks);
let borrowed = loadData("libraryBorrowed", []);
let history = loadData("libraryHistory", []);
let requests = loadData("libraryRequests", []);
let category = "All";

function saveData() {
    localStorage.setItem("libraryBooks", JSON.stringify(books));
    localStorage.setItem("libraryBorrowed", JSON.stringify(borrowed));
    localStorage.setItem("libraryHistory", JSON.stringify(history));
    localStorage.setItem("libraryRequests", JSON.stringify(requests));
}

function renderBook(book, showButton = true) {
    const isBorrowed = borrowed.some(b => b.id === book.id);

    return `
        <div class="book-card">
            <div class="book-cover">
                <img src="${book.image || ''}"
                     alt="${book.title}"
                     onerror="this.src='https://placehold.co/300x400/e5eee8/193d32?text=Book+Cover'">
            </div>
            <div class="book-info">
                <small>${book.genre}</small>
                <h3>${book.title}</h3>
                <p>By ${book.author}</p>
                ${showButton ? `
                    <button class="book-btn"
                        onclick="toggleBorrow(${book.id})"
                        ${!isBorrowed && book.copies <= 0 ? 'disabled' : ''}>
                        ${isBorrowed ? "Return Book" :
                          book.copies <= 0 ? "Unavailable" : "Borrow Book"}
                    </button>` : ""}
            </div>
        </div>`;
}

function renderAll() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const genre = document.getElementById("genreFilter").value;

    const filtered = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(search) ||
            book.author.toLowerCase().includes(search) ||
            book.genre.toLowerCase().includes(search);

        const matchesCategory =
            category === "All" || book.genre === category;

        const matchesGenre =
            genre === "All" || book.genre === genre;

        return matchesSearch && matchesCategory && matchesGenre;
    });

    document.getElementById("allBooks").innerHTML =
        filtered.length
        ? filtered.map(book => renderBook(book)).join("")
        : '<div class="empty-state">No books found. Try another search.</div>';

    document.getElementById("popularBooks").innerHTML =
        books.slice(0, 4).map(book => renderBook(book)).join("");

    document.getElementById("myBooks").innerHTML =
        borrowed.length
        ? borrowed.map(book => renderBook(book)).join("")
        : '<div class="empty-state">Your bookshelf is empty. Explore books to get started!</div>';

    document.getElementById("historyList").innerHTML =
        history.length
        ? history.map(item => `
            <div class="history-item">
                📖 <strong>${item.title}</strong>
                <span> — Returned on ${item.date}</span>
            </div>`).join("")
        : '<div class="empty-state">Your reading history will appear here.</div>';

    document.getElementById("requestList").innerHTML =
        requests.length
        ? requests.map(item => `
            <div class="request-item">
                <strong>${item.title}</strong> by ${item.author}
                <p>Status: ${item.status}</p>
            </div>`).join("")
        : '<div class="empty-state">No book requests yet.</div>';

    document.getElementById("borrowedCount").textContent = borrowed.length;
    document.getElementById("dueCount").textContent = borrowed.length;
    document.getElementById("readCount").textContent = history.length;
    document.getElementById("requestCount").textContent =
        requests.filter(r => r.status === "Pending").length;

    saveData();
}

function toggleBorrow(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    const existing = borrowed.find(b => b.id === id);

    if (existing) {
        borrowed = borrowed.filter(b => b.id !== id);
        book.copies++;

        history.unshift({
            title: book.title,
            date: new Date().toLocaleDateString()
        });

        alert("Book returned successfully!");
    } else {
        if (book.copies <= 0) {
            alert("Sorry, this book is unavailable.");
            return;
        }

        book.copies--;
        borrowed.push({...book});
        alert("Book borrowed successfully!");
    }

    renderAll();
}

// SEARCH

document.getElementById("searchInput").addEventListener("input", renderAll);
document.getElementById("genreFilter").addEventListener("change", renderAll);

// CATEGORY FILTER

document.querySelectorAll(".category").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".category").forEach(b =>
            b.classList.remove("active")
        );

        button.classList.add("active");
        category = button.dataset.category;
        renderAll();
    });
});

// BOOK REQUEST FORM

document.getElementById("requestForm").addEventListener("submit", e => {
    e.preventDefault();

    requests.push({
        title: document.getElementById("requestTitle").value,
        author: document.getElementById("requestAuthor").value,
        reason: document.getElementById("requestReason").value,
        status: "Pending"
    });

    e.target.reset();
    renderAll();
    alert("Your book request has been submitted!");
});

// ADD NEW BOOK

document.getElementById("addBookForm").addEventListener("submit", e => {
    e.preventDefault();

    const title = document.getElementById("newTitle").value.trim();
    const author = document.getElementById("newAuthor").value.trim();
    const genre = document.getElementById("newGenre").value;
    const image = document.getElementById("newImage").value.trim();

    books.push({
        id: Date.now(),
        title,
        author,
        genre,
        image: image || "https://placehold.co/300x400/e5eee8/193d32?text=Book+Cover",
        copies: 1
    });

    e.target.reset();
    renderAll();
    alert("New book added successfully!");
});

// DARK MODE

document.getElementById("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const dark = document.body.classList.contains("dark");
    document.getElementById("themeBtn").textContent =
        dark ? "☀" : "☾";

    localStorage.setItem("libraryDark", dark);
});

if (localStorage.getItem("libraryDark") === "true") {
    document.body.classList.add("dark");
    document.getElementById("themeBtn").textContent = "☀";
}

// SIDEBAR NAVIGATION

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach(item =>
            item.classList.remove("active")
        );

        link.classList.add("active");
    });
});

// INITIAL LOAD

renderAll();