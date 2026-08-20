/* TaskFlow
   Our tasks live inside this file for now. */

// Every task is an object with three pieces of information.
const tasks = [
  {
    id: 1,
    title: "Design the TaskFlow page",
    completed: true,
  },
  {
    id: 2,
    title: "Write the HTML structure",
    completed: true,
  },
  {
    id: 3,
    title: "Style the statistic cards",
    completed: false,
  },
  {
    id: 4,
    title: "Build the task list",
    completed: false,
  },
  {
    id: 5,
    title: "Practice JavaScript",
    completed: false,
  },
  {
    id: 6,
    title: "Learn how an API works",
    completed: false,
  },
  {
    id: 7,
    title: "Read about JavaScript objects",
    completed: true,
  },
  {
    id: 8,
    title: "Help a teammate with CSS",
    completed: true,
  },
  {
    id: 9,
    title: "Prepare questions for the next session",
    completed: false,
  },
];

let currentFilter = "all";

let searchText = "";

// The parts of the page that JavaScript needs to change.
const taskList = document.querySelector("#taskList");
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
    const matchesSearch = title.includes(search); // boolean t/f

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
  // console.log("All");
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

// Show the page for the first time.
updateStats();
renderTasks();
updateProgressText();
