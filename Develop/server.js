const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // Using uuid for unique IDs

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dbPath = path.join(__dirname, "db/db.json");

// Helper function to read the database file
const readDbFile = (callback) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read notes", err);
      callback(err, null);
      return;
    }
    callback(null, JSON.parse(data));
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
    callback(null);
  });
};

// API Routes
app.get("/api/notes", (req, res) => {
  readDbFile((err, notes) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }
    res.json(notes);
  });
});

app.post("/api/notes", (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4(); // Generate a unique ID

  readDbFile((err, notes) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }

    notes.push(newNote);

    writeDbFile(notes, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save note" });
      }
      res.json(newNote);
    });
  });
});

app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;

  readDbFile((err, notes) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }

    const filteredNotes = notes.filter((note) => note.id !== noteId);

    writeDbFile(filteredNotes, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete note" });
      }
      res.json({ message: "Note deleted" });
    });
  });
});

// HTML Routes
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "notes.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
