let tasks = [];
let taskList = document.getElementById('task-list');
let tabs = document.querySelectorAll('.tabs button');
let currentFilter = 'all';
let progressBar = document.querySelector('.progress-bar div');

async function fetchDailyQuote() {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();
    const quote = data[0].q;
    const author = data[0].a;
    const quoteElement = document.getElementById('daily-quote');
    quoteElement.textContent = `"${quote}" - ${author}`;
}

fetchDailyQuote();

function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);
    const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
    clockElement.textContent = `${formattedDate} ${formattedTime}`;
}

setInterval(updateClock, 1000);

function createMiniCalendar() {
    const calendarElement = document.getElementById('mini-calendar');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    let date = 1;
    for (let i = 0; i < 6; i++) { // Max 6 weeks in a month
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                const td = document.createElement('td');
                td.textContent = '';
                row.appendChild(td);
            } else if (date > daysInMonth) {
                break;
            } else {
                const td = document.createElement('td');
                td.textContent = date;
                if (date === now.getDate()) {
                    td.style.backgroundColor = '#4CAF50';
                    td.style.color = 'white';
                }
                date++;
                row.appendChild(td);
            }
        }
        tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    calendarElement.appendChild(table);
}

createMiniCalendar();

function addTask() {
    const taskName = document.getElementById('task-name').value.trim();
    const taskTime = parseInt(document.getElementById('task-time').value, 10);

    if (taskName && taskTime > 0) {
        const li = document.createElement('li');
        li.textContent = taskName;
        li.dataset.time = taskTime * 60; // Convert minutes to seconds
        li.dataset.elapsed = 0;
        li.dataset.running = false;

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        const startButton = document.createElement('button');
        startButton.className = 'start-button';
        startButton.textContent = 'Start';
        startButton.onclick = () => startTimer(li);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteTask(li);

        const timer = document.createElement('span');
        timer.className = 'timer';

        taskActions.appendChild(startButton);
        taskActions.appendChild(deleteButton);
        taskActions.appendChild(timer);

        li.appendChild(taskActions);
        taskList.appendChild(li);
        tasks.push({ name: taskName, time: taskTime * 60, elapsed: 0, running: false });
        updateProgress();
        document.getElementById('task-name').value = '';
        document.getElementById('task-time').value = '';
        filterTasks(currentFilter);
    } else {
        alert('Please enter a valid task name and time.');
    }
}

function startTimer(li) {
    if (li.dataset.running === 'false') {
        const interval = setInterval(() => {
            const elapsed = parseInt(li.dataset.elapsed, 10);
            const time = parseInt(li.dataset.time, 10);
            if (elapsed >= time) {
                clearInterval(interval);
                li.classList.add('completed');
                updateProgress();
                li.querySelector('button').textContent = 'Start';
                li.dataset.running = false;
                li.querySelector('button').style.backgroundColor = '#4CAF50'; // Green color
            } else {
                li.dataset.elapsed = elapsed + 1;
                li.querySelector('.timer').textContent = formatTime(time - elapsed);
            }
        }, 1000);
        li.dataset.running = true;
        li.querySelector('button').textContent = 'Pause';
        li.querySelector('button').style.backgroundColor = '#ff9500'; // Orange color
    } else {
        clearInterval(li.dataset.interval);
        li.dataset.running = false;
        li.querySelector('button').textContent = 'Start';
        li.querySelector('button').style.backgroundColor = '#4CAF50'; // Green color
    }
}

function deleteTask(li) {
    taskList.removeChild(li);
    tasks = tasks.filter(task => task.name !== li.textContent);
    updateProgress();
}

function filterTasks(filter) {
    currentFilter = filter;
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.name;
        li.dataset.time = task.time;
        li.dataset.elapsed = task.elapsed;
        li.dataset.running = task.running;

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        const startButton = document.createElement('button');
        startButton.className = 'start-button';
        startButton.textContent = 'Start';
        startButton.onclick = () => startTimer(li);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteTask(li);

        const timer = document.createElement('span');
        timer.className = 'timer';
        timer.textContent = formatTime(task.time - task.elapsed);

        taskActions.appendChild(startButton);
        taskActions.appendChild(deleteButton);
        taskActions.appendChild(timer);

        li.appendChild(taskActions);
        if (filter === 'all' || (filter === 'completed' && task.elapsed >= task.time) || (filter === 'remaining' && task.elapsed < task.time) || (filter === 'ongoing' && task.running === 'true')) {
            taskList.appendChild(li);
        }
    });
}

function updateProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.elapsed >= task.time).length;
    const progress = (completedTasks / totalTasks) * 100;
    progressBar.style.width = `${progress}%`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}