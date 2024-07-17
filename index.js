// const PORT = process.env.PORT || 8000

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8000;

// Load dictionary data once on startup
const wordsData = JSON.parse(fs.readFileSync('keys.json', 'utf-8')); // Specify encoding for reliability

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting (Enhanced with Middleware)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter); // Apply to all requests

// Helper Functions
function filterWords(words, start, end, limit) {
  return words.filter(word => {
    const firstLetter = word.word[0].toLowerCase();
    return firstLetter >= start && firstLetter <= end;
  }).slice(0, limit);
}

// Routes
app.get('/words/:FromWord-:toWord', (req, res) => {
  const { start = req.params.FromWord, end = req.params.toWord, limit = 100 } = req.query;
  const filtered = filterWords(wordsData, start, end, parseInt(limit));
  res.json(filtered);
});

// Routes
app.get('/words/:FromWord-:toWord/:WordLimit', (req, res) => {
    if (req.params.WordLimit<1000) {
        const { start = req.params.FromWord, end = req.params.toWord, limit = req.params.WordLimit } = req.query;
        const filtered = filterWords(wordsData, start, end, parseInt(limit));
        res.json(filtered);
        
    } else {
        res.json("Max Word Limit is 1000 ! Your request : "+ req.params.WordLimit)

    }
  });
  app.get('/words/:Character/:WordLimit', (req, res) => {
    const word_limit= req.params.WordLimit;
    if (word_limit) {
        const { start = req.params.Character, end = req.params.Character, limit = word_limit } = req.query;
        const filtered = filterWords(wordsData, start, end, parseInt(limit));
        res.json(filtered);
        
    } else {
        res.json("Max Word Limit is 1000 ! Your request : "+ req.params.WordLimit)

    }
  }); 

  app.get('/words/:Character', (req, res) => {
    const word_limit= 100;
    if (word_limit) {
        const { start = req.params.Character, end = req.params.Character, limit = word_limit } = req.query;
        const filtered = filterWords(wordsData, start, end, parseInt(limit));
        res.json(filtered);
        
    } else {
        res.json("Max Word Limit is 1000 ! Your request : "+ req.params.WordLimit)

    }
  }); 

app.get('/words', (req, res) => {
    const { start = 'a', end = 'z', limit = 100 } = req.query;
    const filtered = filterWords(wordsData, start, end, parseInt(limit));
    res.json(filtered); 
  });
  
app.get('/words/limit=:WordLimit', (req, res) => {
    if (req.params.WordLimit<1001) {
        const { start = 'a', end = 'z', limit = req.params.WordLimit } = req.query;
        const filtered = filterWords(wordsData, start, end, parseInt(limit));
        res.json(filtered); 
        
    } else {
        res.json("Max Word Limit is 1000 ! Your request : "+ req.params.WordLimit)
    }
  });
  
app.get('/word/:wordName', (req, res) => {
  const word = wordsData.find(
    (word) => word.word.toLowerCase() === req.params.wordName.toLowerCase()
  );
  if (word) res.json(word);
  else res.status(404).json({ error: 'Word not found' });
});


app.get('/random/limit=:randomWordsCount?', (req, res) => {
    const count = parseInt(req.params.randomWordsCount) || 100; // Default to 1 word if count is not provided
    const randomWords = [];
  
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * wordsData.length);
      randomWords.push(wordsData[randomIndex]);
    }
  
    res.json(randomWords);
  });
// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
