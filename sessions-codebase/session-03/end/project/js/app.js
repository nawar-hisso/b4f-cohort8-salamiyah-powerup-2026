/* TaskFlow
   Our tasks are not written in this file any more.
   We ask an API for them every time the page opens. */

// The address we ask for our tasks.
const API_URL = "https://jsonplaceholder.typicode.com/todos?_limit=15";

// The tasks we received from the API. The list starts empty.
let tasks = [];

// Which filter the user selected: "all", "completed" or "pending".
let currentFilter = "all";

// The parts of the page that JavaScript needs to change.
const taskList = document.querySelector("#taskList");
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");

const totalCount = document.querySelector("#totalCount");
const completedCount = document.querySelector("#completedCount");
const pendingCount = document.querySelector("#pendingCount");

const filterAllButton = document.querySelector("#filterAll");
const filterCompletedButton = document.querySelector("#filterCompleted");
const filterPendingButton = document.querySelector("#filterPending");


// Show the waiting message and hide any old error message.
function showLoading() {
    loadingMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");
}


function hideLoading() {
    loadingMessage.classList.add("hidden");
}


// Hide the waiting message and tell the user that something went wrong.
function showError() {
    loadingMessage.classList.add("hidden");
    errorMessage.classList.remove("hidden");
}


// Ask the API for the tasks and then show them on the page.
async function loadTasks() {
    showLoading();

    try {
        const response = await fetch(API_URL);

        // The server answered, but the answer can still be an error.
        if (!response.ok) {
            showError();
            return;
        }

        // The answer arrives as text, so we turn it into JavaScript objects.
        tasks = await response.json();

        hideLoading();
        updateStats();
        renderTasks();
    } catch (error) {
        // We arrive here when the request could not be made at all,
        // for example when there is no internet connection.
        showError();
    }
}


// Count the tasks and write the numbers into the three cards.
function updateStats() {
    let completed = 0;
    let pending = 0;

    for (const task of tasks) {
        if (task.completed) {
            completed++;
        } else {
            pending++;
        }
    }

    totalCount.textContent = tasks.length;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}


// Build a smaller list that only holds the tasks the user wants to see.
function getVisibleTasks() {
    const visibleTasks = [];

    for (const task of tasks) {
        if (currentFilter === "all") {
            visibleTasks.push(task);
        } else if (currentFilter === "completed" && task.completed) {
            visibleTasks.push(task);
        } else if (currentFilter === "pending" && !task.completed) {
            visibleTasks.push(task);
        }
    }

    return visibleTasks;
}


// Build the HTML for the visible tasks and put it on the page.
function renderTasks() {
    const visibleTasks = getVisibleTasks();

    // A filter can end up with nothing to show, so tell the user
    // instead of leaving an empty page.
    if (visibleTasks.length === 0) {
        taskList.innerHTML = `<li class="task-item">No tasks to show.</li>`;
        return;
    }

    let html = "";

    for (const task of visibleTasks) {
        let statusClass = "pending";
        let statusText = "Pending";

        if (task.completed) {
            statusClass = "completed";
            statusText = "Completed";
        }

        html += `
            <li class="task-item">
                <span class="task-title">${task.title}</span>
                <span class="task-status ${statusClass}">${statusText}</span>
            </li>
        `;
    }

    taskList.innerHTML = html;
}


// Remember the new filter, move the blue colour to the button
// the user clicked, and draw the list again.
function setFilter(newFilter, clickedButton) {
    currentFilter = newFilter;

    filterAllButton.classList.remove("active");
    filterCompletedButton.classList.remove("active");
    filterPendingButton.classList.remove("active");

    clickedButton.classList.add("active");

    renderTasks();
}


filterAllButton.addEventListener("click", function () {
    setFilter("all", filterAllButton);
});

filterCompletedButton.addEventListener("click", function () {
    setFilter("completed", filterCompletedButton);
});

filterPendingButton.addEventListener("click", function () {
    setFilter("pending", filterPendingButton);
});


// Start the application.
loadTasks();
