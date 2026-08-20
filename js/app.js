/* TaskFlow JavaScript.
   This file is empty for now. We start using it in Session 2. */
/* TaskFlow
   Our tasks live inside this file for now. */

// Every task is an object with three pieces of information.
const API_URL = "https://jsonplaceholder.typicode.com/todos?_limit=15";

let tasks = [];

let currentFilter = "all";

let searchText = "";

const taskList = document.querySelector("#taskList");

const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");

const progressText = document.querySelector("#progressText");
const searchInput = document.querySelector("#searchInput");

const totalCount = document.querySelector("#totalCount");
const completedCount = document.querySelector("#completedCount");
const pendingCount = document.querySelector("#pendingCount");

const filterAllButton = document.querySelector("#filterAll");
const filterCompletedButton = document.querySelector("#filterCompleted");
const filterPendingButton = document.querySelector("#filterPending");

function updateProgressText() {
  let completed = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed++;
    }
  }

  progressText.textContent = `${completed} of ${tasks.length} tasks completed`;
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

async function loadTasks() {
  showLoading();

  const response = await fetch(API_URL);

  tasks = await response.json();

  hideLoading();
  updateStats();
  renderTasks();
  updateProgressText();
}

function getVisibleTasks() {
  const visibleTasks = [];

  for (const task of tasks) {
    let matchesFilter = false;

    if (currentFilter === "all") {
      matchesFilter = true;
    } else if (currentFilter === "completed" && task.completed) {
      matchesFilter = true;
    } else if (currentFilter === "pending" && !task.completed) {
      matchesFilter = true;
    }

    const title = task.title.toLowerCase();
    const search = searchText.toLowerCase();
    console.log(title);
    console.log(search);
    const matchesSearch = title.includes(search);

    if (matchesFilter && matchesSearch) {
      visibleTasks.push(task);
    }
  }

  return visibleTasks;
}

// Build the HTML for every task and put it on the page.
function renderTasks() {
  const visibleTasks = getVisibleTasks();
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

  //   console.log(html);

  taskList.innerHTML = html;
}

function setFilter(newFilter, clickedButton) {
  currentFilter = newFilter;

  console.log(newFilter);
  console.log(newFilter);

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

searchInput.addEventListener("input", function () {
  searchText = searchInput.value;

  // console.log(searchText);
  renderTasks();
});

function showLoading() {
  loadingMessage.classList.remove("hidden");
}

function hideLoading() {
  loadingMessage.classList.add("hidden");
}

loadTasks();
