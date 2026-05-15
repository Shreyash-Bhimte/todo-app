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
  } else {
    emptyState.style.display = "none";

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

  // Step 4: update remaining count
  const activeCount = todos.filter(function (t) { return !t.completed; }).length;
  remainingCount.textContent = activeCount === 1
    ? "1 task left"
    : activeCount + " tasks left";
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
// ADD TODO
// ================================
function addTodo() {
  const text = todoInput.value.trim();

  // Edge case: empty input
  if (text === "") return;

  // Edge case: duplicate prevention
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

  // Create new todo object
  const newTodo = {
    id: generateId(),
    text: text,
    completed: false,
  };

  // Update state
  todos.push(newTodo);

  // Clear input
  todoInput.value = "";

  // Re-render
  renderTodos();
}

// ================================
// EVENT LISTENERS
// ================================

// Add button click
addBtn.addEventListener("click", addTodo);

// Enter key in input
todoInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") addTodo();
});

// ================================
// INITIALISE
// ================================
renderTodos();