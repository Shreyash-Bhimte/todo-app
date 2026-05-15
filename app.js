// ================================
// STATE — single source of truth
// ================================
let todos = [];
let currentFilter = "all";

// ================================
// DOM REFERENCES
// ================================
const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const remainingCount = document.getElementById("remaining-count");
const clearCompletedBtn = document.getElementById("clear-completed-btn");
// ================================
// GENERATE UNIQUE ID
// ================================
function generateId() {
  return Date.now().toString();
}

// ================================
// RENDER — single function that
// redraws the entire list from state
// ================================
function renderTodos() {
  // Step 1: decide which todos to show based on current filter
  const filtered = todos.filter(function (todo) {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true; // "all"
  });

  // Step 2: wipe the current list
  todoList.innerHTML = "";

// Step 3: show empty state or build list items
  if (filtered.length === 0) {
    emptyState.style.display = "block";

    if (currentFilter === "active") {
      emptyState.textContent = "No active tasks. Well done!";
    } else if (currentFilter === "completed") {
      emptyState.textContent = "No completed tasks yet.";
    } else {
      emptyState.textContent = "No tasks yet. Add one above!";
    }

  } else {
    emptyState.style.display = "none";

    // THIS PART WAS MISSING — builds the actual list items
    filtered.forEach(function (todo) {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " completed" : "");
      li.dataset.id = todo.id;

      li.innerHTML = `
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.completed ? "checked" : ""}
        />
        <span class="todo-text">${escapeHTML(todo.text)}</span>
        <button class="delete-btn" aria-label="Delete todo">✕</button>
      `;

      todoList.appendChild(li);
    });
  }

  // Step 4: update remaining count + clear completed visibility
  const activeCount = todos.filter(function (t) { return !t.completed; }).length;
  remainingCount.textContent = activeCount === 1
    ? "1 task left"
    : activeCount + " tasks left";

  const completedCount = todos.filter(function (t) { return t.completed; }).length;
  clearCompletedBtn.style.visibility = completedCount > 0 ? "visible" : "hidden";
}

// ================================
// ESCAPE HTML — security habit
// ================================
function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ================================
// LOCALSTORAGE
// ================================
function saveToStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadFromStorage() {
  const stored = localStorage.getItem("todos");
  if (stored) {
    todos = JSON.parse(stored);
  }
}

// ================================
// ADD TODO
// ================================
function addTodo() {
  const text = todoInput.value.trim();
  if (text === "") return;

  const isDuplicate = todos.some(function (todo) {
    return todo.text.toLowerCase() === text.toLowerCase();
  });
  if (isDuplicate) {
    todoInput.style.borderColor = "var(--danger)";
    setTimeout(function () {
      todoInput.style.borderColor = "";
    }, 1000);
    return;
  }

  const newTodo = {
    id: generateId(),
    text: text,
    completed: false,
  };

  todos.push(newTodo);
  todoInput.value = "";
  saveToStorage(); // ADD THIS
  renderTodos();
}

function toggleComplete(id) {
  const todo = todos.find(function (t) { return t.id === id; });
  if (!todo) return;
  todo.completed = !todo.completed;
  saveToStorage(); // ADD THIS
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(function (t) { return t.id !== id; });
  saveToStorage(); // ADD THIS
  renderTodos();
}

// ================================
// CLEAR COMPLETED
// ================================
function clearCompleted() {
  todos = todos.filter(function (t) { return !t.completed; });
  saveToStorage();
  renderTodos();
}
// ================================
// EVENT LISTENERS
// ================================

// Add button click
addBtn.addEventListener("click", addTodo);
// Clear completed
clearCompletedBtn.addEventListener("click", clearCompleted);
// Enter key in input
todoInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") addTodo();
});

// Event delegation — one listener on the list
// handles clicks on ALL checkboxes and delete buttons
todoList.addEventListener("click", function (e) {
    console.log("clicked:", e.target, "classes:", e.target.className);
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;

  if (e.target.classList.contains("todo-checkbox")) {
    toggleComplete(id);
  }

  if (e.target.classList.contains("delete-btn")) {
    deleteTodo(id);
  }
});

// Filter tabs
document.querySelectorAll(".filter-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    // Update state
    currentFilter = btn.dataset.filter;

    // Update active class on tabs
    document.querySelectorAll(".filter-btn").forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");

    // Re-render with new filter
    renderTodos();
  });
});

// ================================
// INITIALISE
// ================================
loadFromStorage();
renderTodos();

