/* TaskFlow JavaScript.
   This file is empty for now. We start using it in Session 2. */
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
];

const taskList = document.querySelector("#taskList");

const totalCount = document.querySelector("#totalCount");
const completedCount = document.querySelector("#completedCount");
const pendingCount = document.querySelector("#pendingCount");

console.log(completedCount);

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

// Build the HTML for every task and put it on the page.
function renderTasks() {
  let html = "";

  for (const task of tasks) {
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

updateStats();
renderTasks();
