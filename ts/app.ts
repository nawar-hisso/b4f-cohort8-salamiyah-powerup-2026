/* TaskFlow JavaScript.
   This file is empty for now. We start using it in Session 2. */
/* TaskFlow
   Our tasks live inside this file for now. */

// Every task is an object with three pieces of information.

interface Task {
  userId: number;
  title: string;
  completed: boolean;
}

interface User {
  id: number;
  name: string;
}

const API_URL: string = "https://jsonplaceholder.typicode.com/todos?_limit=50";

const USERS_URL: string = "https://jsonplaceholder.typicode.com/users";

let tasks: Task[] = [];

let users: User[] = [];

let currentFilter: string = "all";

let searchText: string = "";

let selectedUserId: number = 0;

const taskList = document.querySelector<HTMLUListElement>("#taskList");

const loadingMessage =
  document.querySelector<HTMLParagraphElement>("#loadingMessage");
const errorMessage =
  document.querySelector<HTMLParagraphElement>("#errorMessage");

const progressText =
  document.querySelector<HTMLParagraphElement>("#progressText");
const searchInput = document.querySelector<HTMLInputElement>("#searchInput");

const totalCount = document.querySelector<HTMLSpanElement>("#totalCount");
const completedCount =
  document.querySelector<HTMLSpanElement>("#completedCount");
const pendingCount = document.querySelector<HTMLSpanElement>("#pendingCount");

const filterAllButton = document.querySelector<HTMLButtonElement>("#filterAll");
const filterCompletedButton =
  document.querySelector<HTMLButtonElement>("#filterCompleted");
const filterPendingButton =
  document.querySelector<HTMLButtonElement>("#filterPending");

const peopleList = document.querySelector<HTMLUListElement>("#peopleList");

const allPeopleButton =
  document.querySelector<HTMLButtonElement>("#allPeopleButton");

function updateProgressText(): void {
  if (!progressText) return;

  let completed: number = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed++;
    }
  }

  progressText.textContent = `${completed} of ${tasks.length} tasks completed`;
}

// Count the tasks and write the numbers into the three cards.
function updateStats(): void {
  if (!totalCount || !completedCount || !pendingCount) return;

  let completed: number = 0;
  let pending: number = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed++;
    } else {
      pending++;
    }
  }

  totalCount.textContent = String(tasks.length);
  completedCount.textContent = String(completed);
  pendingCount.textContent = String(pending);
}

async function loadTasks(): Promise<void> {
  showLoading();

  try {
    await loadUsers();

    const response = await fetch(API_URL);

    // throw new Error();

    tasks = (await response.json()) as Task[];

    hideLoading();
    updateStats();
    renderTasks();
    updateProgressText();
    renderPeopleSummary();
  } catch (error) {
    showError();
  }
}

async function loadUsers(): Promise<void> {
  try {
    const response = await fetch(USERS_URL);

    users = (await response.json()) as User[];

    console.log(users);
  } catch (error) {
    users = [];
  }
}

function getUserName(userId: number): string {
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

function renderPeopleSummary(): void {
  if (!peopleList) return;

  let html: string = "";

  for (const user of users) {
    let count: number = 0;

    for (const task of tasks) {
      if (task.userId === user.id) {
        count++;
      }
    }

    // Ten people come back from the API but only some of them own any of
    // the tasks we loaded, so the rest are left out.
    if (count > 0) {
      let word: string = "tasks";

      if (count === 1) {
        word = "task";
      }

      let activeClass: string = "";

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

function addPersonListeners(): void {
  for (const user of users) {
    const personButton = document.querySelector<HTMLButtonElement>(
      `#person-${user.id}`,
    );

    // Somebody with no tasks has no button on the page.
    if (personButton) {
      personButton.addEventListener("click", function () {
        setPerson(user.id);
      });
    }
  }
}

function setPerson(userId: number): void {
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

function getVisibleTasks(): Task[] {
  const visibleTasks: Task[] = [];

  for (const task of tasks) {
    let matchesFilter: boolean = false;

    if (currentFilter === "all") {
      matchesFilter = true;
    } else if (currentFilter === "completed" && task.completed) {
      matchesFilter = true;
    } else if (currentFilter === "pending" && !task.completed) {
      matchesFilter = true;
    }

    const title: string = task.title.toLowerCase();
    const search: string = searchText.toLowerCase();

    const matchesSearch: boolean = title.includes(search);

    let matchesPerson: boolean = false;

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
function renderTasks(): void {
  const visibleTasks: Task[] = getVisibleTasks();
  let html: string = "";

  for (const task of visibleTasks) {
    let statusClass: string = "pending";
    let statusText: string = "Pending";

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

function setFilter(newFilter: string, clickedButton: HTMLButtonElement): void {
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

function showLoading(): void {
  loadingMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
}

function hideLoading(): void {
  loadingMessage.classList.add("hidden");
}

function showError(): void {
  loadingMessage.classList.add("hidden");
  errorMessage.classList.remove("hidden");
}

loadTasks();
