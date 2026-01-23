const API_BASE_URL = 'http://localhost:3000/api';

// Default todos for fallback
const defaultTodos = [
    { id: 1, name: 'todo 1', description: '' },
    { id: 2, name: 'todo 2', description: '' }
];

let todos = [];
let expandedTodoIndex = null;
let useBackend = true;
let nextId = 3;

const todoNameInput = document.getElementById('todoName');
const todoDescriptionInput = document.getElementById('todoDescription');
const addButton = document.getElementById('addButton');
const todoList = document.getElementById('todoList');

// Render todos
function renderTodos() {
    todoList.innerHTML = '';
    
    todos.forEach((todo, index) => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        
        const todoContent = document.createElement('div');
        todoContent.className = 'todo-item-content';
        
        const todoName = document.createElement('div');
        todoName.className = 'todo-item-name';
        todoName.textContent = todo.name;
        
        todoContent.appendChild(todoName);
        
        // Add description if expanded
        if (expandedTodoIndex === index) {
            const todoDescription = document.createElement('div');
            todoDescription.className = 'todo-item-description';
            todoDescription.textContent = todo.description || '';
            todoContent.appendChild(todoDescription);
        }
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'delete';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTodo(todo.id);
        });
        
        todoItem.appendChild(checkbox);
        todoItem.appendChild(todoContent);
        todoItem.appendChild(deleteButton);
        
        // Toggle description on click
        todoItem.addEventListener('click', (e) => {
            // Don't toggle if clicking on checkbox or delete button
            if (e.target === checkbox || e.target === deleteButton) {
                return;
            }
            toggleDescription(index);
        });
        
        todoList.appendChild(todoItem);
    });
}

// Add new todo
async function addTodo() {
    const name = todoNameInput.value.trim();
    const description = todoDescriptionInput.value.trim();
    
    if (!name) return;
    
    if (useBackend) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            });
            
            if (response.ok) {
                todoNameInput.value = '';
                todoDescriptionInput.value = '';
                expandedTodoIndex = null;
                await loadTodos();
            } else {
                throw new Error('Backend request failed');
            }
        } catch (error) {
            console.warn('Backend unavailable, using local storage');
            useBackend = false;
            // Fall through to local storage
        }
    }
    
    // Fallback to local storage if backend is unavailable
    if (!useBackend) {
        const newTodo = {
            id: nextId++,
            name,
            description
        };
        todos.push(newTodo);
        todoNameInput.value = '';
        todoDescriptionInput.value = '';
        expandedTodoIndex = null;
        renderTodos();
        saveToLocalStorage();
    }
}

// Delete todo
async function deleteTodo(id) {
    if (useBackend) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                const deletedIndex = todos.findIndex(t => t.id === id);
                if (expandedTodoIndex === deletedIndex) {
                    expandedTodoIndex = null;
                } else if (expandedTodoIndex !== null && expandedTodoIndex > deletedIndex) {
                    expandedTodoIndex--;
                }
                await loadTodos();
                return;
            } else {
                throw new Error('Backend request failed');
            }
        } catch (error) {
            console.warn('Backend unavailable, using local storage');
            useBackend = false;
            // Fall through to local storage
        }
    }
    
    // Fallback to local storage if backend is unavailable
    if (!useBackend) {
        const deletedIndex = todos.findIndex(t => t.id === id);
        if (deletedIndex !== -1) {
            todos.splice(deletedIndex, 1);
            if (expandedTodoIndex === deletedIndex) {
                expandedTodoIndex = null;
            } else if (expandedTodoIndex !== null && expandedTodoIndex > deletedIndex) {
                expandedTodoIndex--;
            }
            renderTodos();
            saveToLocalStorage();
        }
    }
}

// Toggle description
function toggleDescription(index) {
    if (expandedTodoIndex === index) {
        expandedTodoIndex = null;
    } else {
        expandedTodoIndex = index;
    }
    renderTodos();
}

// Load todos from server
async function loadTodos() {
    if (useBackend) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos`);
            if (response.ok) {
                todos = await response.json();
                // Update nextId based on loaded todos
                if (todos.length > 0) {
                    nextId = Math.max(...todos.map(t => t.id || 0)) + 1;
                }
                renderTodos();
                return;
            } else {
                throw new Error('Backend request failed');
            }
        } catch (error) {
            console.warn('Backend unavailable, using local storage');
            useBackend = false;
            // Fall through to local storage
        }
    }
    
    // Fallback to local storage if backend is unavailable
    if (!useBackend) {
        loadFromLocalStorage();
    }
}

// Save to localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('nextId', nextId.toString());
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Load from localStorage
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('todos');
        if (saved) {
            todos = JSON.parse(saved);
            const savedNextId = localStorage.getItem('nextId');
            if (savedNextId) {
                nextId = parseInt(savedNextId, 10);
            }
        } else {
            // Use default todos if nothing is saved
            todos = [...defaultTodos];
            nextId = 3;
        }
        renderTodos();
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        // Use default todos as last resort
        todos = [...defaultTodos];
        nextId = 3;
        renderTodos();
    }
}

// Event listeners
addButton.addEventListener('click', addTodo);

todoNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initialize
// Try to load from backend first, fallback to localStorage
loadTodos();
