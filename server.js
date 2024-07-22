// Import required modules
const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // Import uuid for generating unique IDs

// Create an instance of the Express app
const app = express();
const PORT = process.env.PORT || 3001; // Set port number

// Middleware to parse incoming request bodies and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Path to the database file
const dbPath = path.join(__dirname, "db/db.json");

// Helper function to read the database file
const readDbFile = (callback) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read notes", err);
      callback(err, null);
      return;
    }
    callback(null, JSON.parse(data)); // Parse and return JSON data
  });
};

// Helper function to write to the database file
const writeDbFile = (data, callback) => {
  fs.writeFile(dbPath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Failed to write notes", err);
      callback(err);
      return;
    }
    callback(null); // Indicate success
  });
};

// API Routes

// GET route to retrieve all notes
app.get("/api/notes", (req, res) => {
  readDbFile((err, notes) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }
    res.json(notes); // Send notes as JSON response
  });
});

// POST route to add a new note
app.post("/api/notes", (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4(); // Generate a unique ID for the new note

  readDbFile((err, notes) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }

    notes.push(newNote); // Add new note to the array

    writeDbFile(notes, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save note" });
      }
      res.json(newNote); // Send the newly added note as JSON response
    });
  });
});

// DELETE route to remove a note by ID
app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;

  readDbFile((err, notes) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }

    // Filter out the note to be deleted
    const filteredNotes = notes.filter((note) => note.id !== noteId);

    writeDbFile(filteredNotes, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete note" });
      }
      res.json({ message: "Note deleted" }); // Send success message
    });
  });
});

// HTML Routes

// GET route to serve the notes HTML page
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "notes.html"));
});

// GET route to serve the index HTML page for any other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
