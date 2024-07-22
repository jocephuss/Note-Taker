document.addEventListener("DOMContentLoaded", () => {
  // Define variables for the form, input fields, buttons, and note list
  let noteForm;
  let noteTitle;
  let noteText;
  let saveNoteBtn;
  let newNoteBtn;
  let clearBtn;
  let noteList;

  // Initialize variables if we are on the notes page
  if (window.location.pathname === "/notes") {
    noteForm = document.querySelector(".note-form");
    noteTitle = document.querySelector(".note-title");
    noteText = document.querySelector(".note-textarea");
    saveNoteBtn = document.querySelector(".save-note");
    newNoteBtn = document.querySelector(".new-note");
    clearBtn = document.querySelector(".clear-btn");
    noteList = document.querySelector(".list-group");
  }

  // Show an element by setting its display style to "inline"
  const show = (elem) => {
    elem.style.display = "inline";
  };

  // Hide an element by setting its display style to "none"
  const hide = (elem) => {
    elem.style.display = "none";
  };

  // Object to keep track of the currently active note
  let activeNote = {};

  // Fetch notes from the server
  const getNotes = () =>
    fetch("/api/notes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

  // Save a new note to the server
  const saveNote = (note) =>
    fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

  // Delete a note from the server
  const deleteNote = (id) =>
    fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

  // Render the currently active note in the form
  const renderActiveNote = () => {
    hide(saveNoteBtn);
    hide(clearBtn);

    if (activeNote.id) {
      show(newNoteBtn);
      noteTitle.setAttribute("readonly", true);
      noteText.setAttribute("readonly", true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
    } else {
      hide(newNoteBtn);
      noteTitle.removeAttribute("readonly");
      noteText.removeAttribute("readonly");
      noteTitle.value = "";
      noteText.value = "";
    }
  };

  // Handle saving a note
  const handleNoteSave = () => {
    const newNote = {
      title: noteTitle.value,
      text: noteText.value,
    };
    saveNote(newNote).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  };

  // Handle deleting a note
  const handleNoteDelete = (e) => {
    e.stopPropagation();

    const note = e.target;
    const noteId = JSON.parse(note.parentElement.getAttribute("data-note")).id;

    if (activeNote.id === noteId) {
      activeNote = {};
    }

    deleteNote(noteId).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  };

  // Handle viewing a note when clicked
  const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.target.parentElement.getAttribute("data-note"));
    renderActiveNote();
  };

  // Handle creating a new note view
  const handleNewNoteView = (e) => {
    activeNote = {};
    show(clearBtn);
    renderActiveNote();
  };

  // Handle showing and hiding buttons based on input
  const handleRenderBtns = () => {
    show(clearBtn);
    if (!noteTitle.value.trim() && !noteText.value.trim()) {
      hide(clearBtn);
    } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
    }
  };

  // Render the list of notes
  const renderNoteList = async (notes) => {
    let jsonNotes = await notes.json();
    if (window.location.pathname === "/notes") {
      noteList.innerHTML = "";
    }

    let noteListItems = [];

    // Create a list item element for each note
    const createLi = (text, delBtn = true) => {
      const liEl = document.createElement("li");
      liEl.classList.add("list-group-item");

      const spanEl = document.createElement("span");
      spanEl.classList.add("list-item-title");
      spanEl.innerText = text;
      spanEl.addEventListener("click", handleNoteView);

      liEl.append(spanEl);

      if (delBtn) {
        const delBtnEl = document.createElement("i");
        delBtnEl.classList.add(
          "fas",
          "fa-trash-alt",
          "float-right",
          "text-danger",
          "delete-note"
        );
        delBtnEl.addEventListener("click", handleNoteDelete);

        liEl.append(delBtnEl);
      }

      return liEl;
    };

    // If no notes, show a message
    if (jsonNotes.length === 0) {
      noteListItems.push(createLi("No saved Notes", false));
    }

    // Add each note to the list
    jsonNotes.forEach((note) => {
      const li = createLi(note.title);
      li.dataset.note = JSON.stringify(note);

      noteListItems.push(li);
    });

    // Append notes to the list
    if (window.location.pathname === "/notes") {
      noteListItems.forEach((note) => noteList.append(note));
    }
  };

  // Get and render the list of notes
  const getAndRenderNotes = () => getNotes().then(renderNoteList);

  // Set up event listeners if on the notes page
  if (window.location.pathname === "/notes") {
    saveNoteBtn.addEventListener("click", handleNoteSave);
    newNoteBtn.addEventListener("click", handleNewNoteView);
    clearBtn.addEventListener("click", renderActiveNote);
    noteForm.addEventListener("input", handleRenderBtns);
  }

  // Fetch and render notes when the page loads
  getAndRenderNotes();
});
