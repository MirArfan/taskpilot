class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.setupEventListeners();
        this.renderTasks();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.filterTasks(e.target.dataset.status);
                // Update active button
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Sort selection
        document.getElementById('sortTasks').addEventListener('change', (e) => {
            this.sortTasks(e.target.value);
        });
    }

    addTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('dueDate').value;
        const priority = document.getElementById('priority').value;

        const task = {
            id: Date.now(),
            title,
            description,
            dueDate,
            priority,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        document.getElementById('taskForm').reset();
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    filterTasks(status) {
        const tasksList = document.getElementById('tasksList');
        const tasks = tasksList.querySelectorAll('.task-card');

        tasks.forEach(task => {
            if (status === 'all' || task.dataset.status === status) {
                task.style.display = 'block';
            } else {
                task.style.display = 'none';
            }
        });
    }

    sortTasks(criterion) {
        switch (criterion) {
            case 'date-asc':
                this.tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'date-desc':
                this.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'priority':
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                this.tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'due-date':
                this.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                break;
        }
        this.renderTasks();
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.dataset.status = task.status;

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <select class="task-status" data-task-id="${task.id}">
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                    <button class="btn-delete" data-task-id="${task.id}">Delete</button>
                </div>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-meta">
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                <span>Created: ${this.formatDate(task.createdAt)}</span>
                ${task.dueDate ? `<span>Due: ${this.formatDate(task.dueDate)}</span>` : ''}
            </div>
        `;

        // Add event listeners
        taskElement.querySelector('.task-status').addEventListener('change', (e) => {
            this.updateTaskStatus(task.id, e.target.value);
        });

        taskElement.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                this.deleteTask(task.id);
            }
        });

        return taskElement;
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
        this.tasks.forEach(task => {
            tasksList.appendChild(this.createTaskElement(task));
        });
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Initialize the task manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
