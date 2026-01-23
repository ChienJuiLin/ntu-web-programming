// Initialize with default todos
const defaultTodos = [
    { name: 'todo 1', description: '' },
    { name: 'todo 2', description: '' }
];

let todos = [...defaultTodos];
let expandedTodoIndex = null;

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
            deleteTodo(index);
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
function addTodo() {
    const name = todoNameInput.value.trim();
    const description = todoDescriptionInput.value.trim();
    
    if (name) {
        todos.push({ name, description });
        todoNameInput.value = '';
        todoDescriptionInput.value = '';
        expandedTodoIndex = null;
        renderTodos();
    }
}

// Delete todo
function deleteTodo(index) {
    todos.splice(index, 1);
    if (expandedTodoIndex === index) {
        expandedTodoIndex = null;
    } else if (expandedTodoIndex !== null && expandedTodoIndex > index) {
        expandedTodoIndex--;
    }
    renderTodos();
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

// Event listeners
addButton.addEventListener('click', addTodo);

todoNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initialize
renderTodos();
