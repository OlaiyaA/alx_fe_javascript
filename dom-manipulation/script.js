// ---- Step 1: Setup ---- //
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');
const syncStatus = document.getElementById('syncStatus'); // add a small <div id="syncStatus"></div> in your HTML

// ---- Step 2: Load from localStorage ---- //
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "The secret of getting ahead is getting started.", category: "Motivation" },
  { text: "Happiness depends upon ourselves.", category: "Life" },
];

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ---- Populate category dropdown ---- //
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// ---- Filter Quotes ---- //
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);

  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <span style="color:#2563eb;">— ${randomQuote.category}</span>
  `;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// ---- Show Random Quote ---- //
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  if (selectedCategory !== 'all') {
    filterQuotes();
    return;
  }

  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available yet. Add one!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <span style="color:#2563eb;">— ${randomQuote.category}</span>
  `;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// ---- Add New Quote ---- //
function createAddQuoteForm() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert('Please fill both the quote and category fields.');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  newQuoteText.value = '';
  newQuoteCategory.value = '';

  alert('New quote added successfully!');
  showRandomQuote();
  syncToServer(); // push new data to “server” on add
}

// ---- Export ---- //
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
});

// ---- Import ---- //
importFile.addEventListener('change', (event) => {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
        showRandomQuote();
      } else {
        alert('Invalid JSON format.');
      }
    } catch (error) {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
});

// ---- Event listeners ---- //
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', createAddQuoteForm);

// ---- Restore last viewed ---- //
const lastViewed = sessionStorage.getItem('lastViewedQuote');
if (lastViewed) {
  const q = JSON.parse(lastViewed);
  quoteDisplay.innerHTML = `
    <p>"${q.text}"</p>
    <span style="color:#2563eb;">— ${q.category}</span>
  `;
} else {
  showRandomQuote();
}

populateCategories();

const savedCategory = localStorage.getItem('selectedCategory');
if (savedCategory) {
  categoryFilter.value = savedCategory;
  filterQuotes();
}

// ---------------- SERVER SYNC SIMULATION ---------------- //

// Mock server URL (JSONPlaceholder or your mock API)
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Fetch quotes from “server” (simulated)
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const serverData = await res.json();

    // Simulate that serverData contains quotes
    const serverQuotes = serverData.slice(0, 4).map((item, i) => ({
      text: item.title,
      category: i % 2 === 0 ? "Server" : "Fetched"
    }));

    handleConflictResolution(serverQuotes);
  } catch (error) {
    console.error("Server fetch failed:", error);
    updateSyncStatus("⚠️ Failed to fetch from server", "red");
  }
}

// Push local quotes to “server” (simulated)
async function syncToServer() {
  try {
    await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes)
    });
    updateSyncStatus("✅ Synced with server", "green");
  } catch (error) {
    console.error("Server sync failed:", error);
    updateSyncStatus("⚠️ Failed to sync", "red");
  }
}

// ---- Conflict Resolution ---- //
function handleConflictResolution(serverQuotes) {
  let conflictCount = 0;

  serverQuotes.forEach(sq => {
    const localMatch = quotes.find(lq => lq.text === sq.text);
    if (!localMatch) {
      // New quote from server
      quotes.push(sq);
    } else if (localMatch.category !== sq.category) {
      // Conflict → Server wins
      localMatch.category = sq.category;
      conflictCount++;
    }
  });

  if (conflictCount > 0) {
    updateSyncStatus(`⚡ ${conflictCount} conflicts resolved — server data used`, "orange");
  } else {
    updateSyncStatus("✅ Data up to date", "green");
  }

  saveQuotes();
  populateCategories();
}

// ---- Status Display ---- //
function updateSyncStatus(message, color = "black") {
  if (syncStatus) {
    syncStatus.textContent = message;
    syncStatus.style.color = color;
  }
}

// ---- Periodic Sync ---- //
setInterval(() => {
  fetchQuotesFromServer();
}, 30000); // every 30 seconds
