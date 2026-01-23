const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'todos.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize data file if it doesn't exist
async function initializeDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        // File doesn't exist, create with default data
        const defaultTodos = [
            { id: 1, name: 'todo 1', description: '' },
            { id: 2, name: 'todo 2', description: '' }
        ];
        await fs.writeFile(DATA_FILE, JSON.stringify(defaultTodos, null, 2));
    }
}

// Read todos from file
async function readTodos() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading todos:', error);
        return [];
    }
}

// Write todos to file
async function writeTodos(todos) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing todos:', error);
        return false;
    }
}

// Get next ID
async function getNextId() {
    const todos = await readTodos();
    if (todos.length === 0) return 1;
    return Math.max(...todos.map(t => t.id || 0)) + 1;
}

// API Routes

// GET /api/todos - Get all todos
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await readTodos();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// POST /api/todos - Add a new todo
app.post('/api/todos', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Todo name is required' });
        }
        
        const todos = await readTodos();
        const newTodo = {
            id: await getNextId(),
            name: name.trim(),
            description: (description || '').trim()
        };
        
        todos.push(newTodo);
        await writeTodos(todos);
        
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create todo' });
    }
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const todos = await readTodos();
        const filteredTodos = todos.filter(todo => todo.id !== id);
        
        if (filteredTodos.length === todos.length) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        await writeTodos(filteredTodos);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

// Start server
async function startServer() {
    await initializeDataFile();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer();
