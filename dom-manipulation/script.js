// ---- Step 1: Initial Setup ----
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// An array of quote objects
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "The secret of getting ahead is getting started.", category: "Motivation" },
  { text: "Happiness depends upon ourselves.", category: "Life" },
];

// ---- Step 2: Function to show a random quote ----
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available yet. Add one!";
    return;
  }

  // Pick a random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Clear existing content
  quoteDisplay.innerHTML = '';

  // Create elements dynamically
  const quoteText = document.createElement('p');
  quoteText.textContent = `"${randomQuote.text}"`;

  const quoteCategory = document.createElement('span');
  quoteCategory.textContent = `— ${randomQuote.category}`;
  quoteCategory.style.color = '#2563eb';
  quoteCategory.style.display = 'block';
  quoteCategory.style.marginTop = '8px';

  // Add them to the display box
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// ---- Step 3: Function to add new quote ----
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert('Please fill both the quote and category fields.');
    return;
  }

  // Create new quote object
  const newQuote = { text, category };
  quotes.push(newQuote); // Add to array

  // Clear inputs
  newQuoteText.value = '';
  newQuoteCategory.value = '';

  // Show success and update display
  alert('New quote added successfully!');
  showRandomQuote();
}

// ---- Step 4: Add event listeners ----
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
