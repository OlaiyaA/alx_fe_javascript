        // ---- Step 1: Setup ----*//
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const categoryFilter = document.getElementById('categoryFilter');

    // ---- Step 2: Load from localStorage if exists ----
    let quotes = JSON.parse(localStorage.getItem('quotes')) || [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
      { text: "The secret of getting ahead is getting started.", category: "Motivation" },
      { text: "Happiness depends upon ourselves.", category: "Life" },
    ];

    // ---- Step 3: Save to localStorage ----
    function saveQuotes() {
      localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    // ---- Populate category dropdown ----
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

    // // ---- Display quotes ----
    // function displayQuotes(quoteList) {
    //   quoteDisplay.innerHTML = '';
    //   if (quoteList.length === 0) {
    //     quoteDisplay.textContent = "No quotes available for this category.";
    //     return;
    //   }

    //   quoteList.forEach(q => {
    //     const div = document.createElement('div');
    //     div.innerHTML = `
    //       <p>"${q.text}"</p>
    //       <span style="color:#2563eb;">— ${q.category}</span>
    //       <hr>
    //     `;
    //     quoteDisplay.appendChild(div);
    //   });
    // }

    // ---- Filter quotes ----
    
    // ---- Filter quotes based on selected category and show one random ----
    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem('selectedCategory', selectedCategory);

        // Filter quotes by category (or show all)
        let filteredQuotes = selectedCategory === 'all'
            ? quotes
            : quotes.filter(q => q.category === selectedCategory);

        // If there are no quotes in that category
        if (filteredQuotes.length === 0) {
            quoteDisplay.textContent = "No quotes available in this category.";
            return;
        }

        // Pick a random one from the filtered quotes
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];

        // Display the random quote
        quoteDisplay.innerHTML = `
            <p>"${randomQuote.text}"</p>
            <span style="color:#2563eb;">— ${randomQuote.category}</span>
        `;

        // Save to sessionStorage as the last viewed quote
        sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
    }

        // ---- Show truly random quote (ignoring filter) ----
    function showRandomQuote() {
        const selectedCategory = categoryFilter.value;

        // If a specific category is selected, use that filter
        if (selectedCategory !== 'all') {
            filterQuotes();
            return;
        }

        // Otherwise, pick any random quote from all
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

    
    // function filterQuotes() {
    //   const selectedCategory = categoryFilter.value;
    //   localStorage.setItem('selectedCategory', selectedCategory);

    //   const filtered = selectedCategory === 'all'
    //     ? quotes
    //     : quotes.filter(q => q.category === selectedCategory);

    //   displayQuotes(filtered);
    // }


    // // ---- Step 4: Show random quote ----
    // function showRandomQuote() {
    //   if (quotes.length === 0) {
    //     quoteDisplay.textContent = "No quotes available yet. Add one!";
    //     return;
    //   }

    //   const randomIndex = Math.floor(Math.random() * quotes.length);
    //   const randomQuote = quotes[randomIndex];

    //   // store last viewed quote in sessionStorage
    //   sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));

    //   quoteDisplay.innerHTML = `
    //     <p>"${randomQuote.text}"</p>
    //     <span style="color:#2563eb; display:block; margin-top:8px;">— ${randomQuote.category}</span>
    //   `;
    // }

    // ---- Step 5: Add new quote ----
    function createAddQuoteForm() {
      const text = newQuoteText.value.trim();
      const category = newQuoteCategory.value.trim();

      if (!text || !category) {
        alert('Please fill both the quote and category fields.');
        return;
      }

      const newQuote = { text, category };
      quotes.push(newQuote);
      saveQuotes(); // persist in localStorage

      newQuoteText.value = '';
      newQuoteCategory.value = '';

      alert('New quote added successfully!');
      showRandomQuote();
    }

    // ---- Step 6: Export quotes as JSON ----
    exportBtn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quotes.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    // ---- Step 7: Import from JSON file ----
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

    // ---- Step 8: Event listeners ----
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', createAddQuoteForm);

    // ---- Step 9: Load last viewed quote from session ----
    const lastViewed = sessionStorage.getItem('lastViewedQuote');
    if (lastViewed) {
      const q = JSON.parse(lastViewed);
      quoteDisplay.innerHTML = `
        <p>"${q.text}"</p>
        <span style="color:#2563eb; display:block; margin-top:8px;">— ${q.category}</span>
      `;
    } else {
      showRandomQuote();
    }


// ---- On load ----
    populateCategories();

    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
      categoryFilter.value = savedCategory;
      filterQuotes();
    } else {
      displayQuotes(quotes);
    }
