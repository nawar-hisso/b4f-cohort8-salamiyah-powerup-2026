/* TaskFlow JavaScript.
   This file is empty for now. We start using it in Session 2. */
/* TaskFlow
   Our tasks live inside this file for now. */

// Every task is an object with three pieces of information.
const API_URL = "https://jsonplaceholder.typicode.com/todos?_limit=50";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";

let tasks = [];

let users = [];

let currentFilter = "all";

let searchText = "";

let selectedUserId = 0;

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

const peopleList = document.querySelector("#peopleList");

const allPeopleButton = document.querySelector("#allPeopleButton");

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

  try {
    await loadUsers();

    const response = await fetch(API_URL);

    // throw new Error();

    tasks = await response.json();

    hideLoading();
    updateStats();
    renderTasks();
    updateProgressText();
    renderPeopleSummary();
  } catch (error) {
    showError();
  }
}

async function loadUsers() {
  try {
    const response = await fetch(USERS_URL);

    users = await response.json();

    console.log(users);
  } catch (error) {
    users = [];
  }
}

function getUserName(userId) {
  for (const user of users) {
    if (user.id === userId) {
      // Returning inside the loop stops the loop immediately.
      return user.name;
    }
  }

  // We only get here when nobody matched. This line is what keeps the word
  // "undefined" off the screen.
  return "Unknown person";
}

function renderPeopleSummary() {
  let html = "";

  for (const user of users) {
    let count = 0;

    for (const task of tasks) {
      if (task.userId === user.id) {
        count++;
      }
    }

    // Ten people come back from the API but only some of them own any of
    // the tasks we loaded, so the rest are left out.
    if (count > 0) {
      let word = "tasks";

      if (count === 1) {
        word = "task";
      }

      let activeClass = "";

      if (selectedUserId === user.id) {
        activeClass = " active";
      }

      html += `
                <li class="person-line">
                    <button class="person-button${activeClass}" id="person-${user.id}">
                        ${user.name} - ${count} ${word}
                    </button>
                </li>
            `;
    }
  }

  peopleList.innerHTML = html;

  addPersonListeners();
}

function addPersonListeners() {
  for (const user of users) {
    const personButton = document.querySelector(`#person-${user.id}`);

    // Somebody with no tasks has no button on the page.
    if (personButton) {
      personButton.addEventListener("click", function () {
        setPerson(user.id);
      });
    }
  }
}

function setPerson(userId) {
  if (selectedUserId === userId) {
    selectedUserId = 0;
  } else {
    selectedUserId = userId;
  }

  if (selectedUserId === 0) {
    allPeopleButton.classList.add("active");
  } else {
    allPeopleButton.classList.remove("active");
  }

  renderPeopleSummary();

  renderTasks();
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

    const matchesSearch = title.includes(search);

    let matchesPerson = false;

    if (selectedUserId === 0) {
      matchesPerson = true;
    } else if (task.userId === selectedUserId) {
      matchesPerson = true;
    }

    if (matchesFilter && matchesSearch && matchesPerson) {
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
                <span class="task-text">
                    <span class="task-title">${task.title}</span>
                    <span class="task-user">${getUserName(task.userId)}</span>
                </span>
                <span class="task-status ${statusClass}">${statusText}</span>
            </li>
        `;
  }

  taskList.innerHTML = html;
}

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

searchInput.addEventListener("input", function () {
  searchText = searchInput.value;

  renderTasks();
});

allPeopleButton.addEventListener("click", function () {
  selectedUserId = 0;
  allPeopleButton.classList.add("active");
  console.log(selectedUserId);

  renderPeopleSummary();
  renderTasks();
});

function showLoading() {
  loadingMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
}

function hideLoading() {
  loadingMessage.classList.add("hidden");
}

function showError() {
  loadingMessage.classList.add("hidden");
  errorMessage.classList.remove("hidden");
}

loadTasks();
