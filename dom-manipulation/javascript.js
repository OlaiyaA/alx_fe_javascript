// ====== Dynamic Quote Generator with Categories & Server Sync ======

// --- Initial Quotes (fallback if localStorage is empty) ---
const defaultQuotes = [
    
    { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", author: "Abdulmalik", category: "Motivation", updatedAt: Date.now() },
    { id: 2, text: "Your limitation—it’s only your imagination.", author: "Unknown", category: "Inspiration", updatedAt: Date.now() },
    { id: 4, text: "The secret of getting ahead is getting started.", author: "Oamo", category: "Motivation", updatedAt: Date.now() },
    { id: 3, text: "Push yourself, because no one else is going to do it for you.", author: "Unknown", category: "Motivation", updatedAt: Date.now() }
    { id: 5, text: "Happiness depends upon ourselves.", author: "Unknown", category: "Life", updatedAt: Date.now() },
];

// --- Load existing quotes from localStorage or defaults ---
let quotes = JSON.parse(localStorage.getItem('quotes')) || defaultQuotes;

// ===== DOM ELEMENTS =====
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteAuthor = document.getElementById("newQuoteAuthor");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');

// ===== FUNCTIONS =====

// Display random quote (filtered by category if applied)
function displayRandomQuote() {
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <small>- ${randomQuote.author}</small>
    <br><span class="category">(${randomQuote.category})</span>
  `;
}

// Populate category dropdown dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) categoryFilter.value = savedCategory;
}

// Filter quotes based on category selection
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);
  displayRandomQuote();
}

// Add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const author = newQuoteAuthor.value.trim() || "Unknown";
  const category = newQuoteCategory.value.trim() || "General";

  if (!text) return alert("Please enter a quote.");

  const newQuote = {
    id: Date.now(),
    text,
    author,
    category,
    updatedAt: Date.now()
  };

  quotes.push(newQuote);
  localStorage.setItem('quotes', JSON.stringify(quotes));

  // Refresh UI
  populateCategories();
  displayRandomQuote();

  newQuoteText.value = "";
  newQuoteAuthor.value = "";
  newQuoteCategory.value = "";

  alert("Quote added successfully!");
}

// ====== SERVER SYNC SECTION ======

// Simulate fetching from a mock server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await res.json();

    // Convert mock posts into quote objects
    return data.slice(0, 5).map(post => ({
      id: post.id,
      text: post.title,
      author: "Server Author",
      category: "Server",
      updatedAt: Date.now()
    }));
  } catch (err) {
    console.error("Error fetching from server:", err);
    return [];
  }
}

// Simulate posting quotes to the server
async function postQuotesToServer(quotes) {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes)
    });
    console.log("Quotes synced to server (simulated).");
  } catch (err) {
    console.error("Error posting to server:", err);
  }
}

// Conflict resolution: prefer server version if newer
function resolveConflicts(localQuotes, serverQuotes) {
  const merged = [];
  const seen = new Set();

  const all = [...localQuotes, ...serverQuotes];
  all.forEach(q => {
    if (!seen.has(q.id)) {
      const sameId = all.filter(item => item.id === q.id);
      const latest = sameId.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b);
      merged.push(latest);
      seen.add(q.id);
    }
  });

  return merged;
}

// Notify user about sync updates
function notifyUser(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.className = "notification";
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

// Perform data synchronization
async function syncQuotes() {
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
  const serverQuotes = await fetchQuotesFromServer();
  const mergedQuotes = resolveConflicts(localQuotes, serverQuotes);

  if (JSON.stringify(localQuotes) !== JSON.stringify(mergedQuotes)) {
    localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
    quotes = mergedQuotes;
    populateCategories();
    displayRandomQuote();
    notifyUser("Quotes updated from server!");
  }

  await postQuotesToServer(mergedQuotes);
  console.log("Sync complete.");
}

// Run sync every 30 seconds
setInterval(syncQuotes, 30000);

// ===== INITIALIZE APP =====
populateCategories();
displayRandomQuote();

// Event Listeners
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", filterQuotes);
