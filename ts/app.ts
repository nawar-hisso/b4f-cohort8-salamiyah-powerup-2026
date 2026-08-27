/* TaskFlow
   Same app, same features. TypeScript is now checking this file more
   carefully than it was five minutes ago. Run tsc, read the errors, and fix
   them - the same way you'd fix any compiler error this course. */

// The shape of one task. This is the information TaskFlow actually uses.
interface Task {
  userId: number;
  title: string;
  completed: boolean;
}

// The shape of one person. The real API sends many more fields (email,
// address, company...) - we only ever read .id and .name, so those are the
// only two the interface names.
interface User {
  id: number;
  name: string;
}

// The address we ask for our tasks.
const TASKS_URL = "https://jsonplaceholder.typicode.com/todos?_limit=50";

// The address that knows the people.
const USERS_URL = "https://jsonplaceholder.typicode.com/users";

// The tasks we received from the API. The list starts empty.
let tasks: Task[] = [];

// The people we received from the API. Also starts empty.
let users: User[] = [];

// Which filter the user selected: "all", "completed" or "pending".
let currentFilter: string = "all";

// The words the user typed in the search box.
let searchText: string = "";

// Which person the user clicked in the summary. 0 means "nobody is chosen",
// so every person's tasks are shown.
let selectedUserId: number = 0;

// The parts of the page that JavaScript needs to change.
const taskList = document.querySelector("#taskList");
const loadingMessage: HTMLParagraphElement | null =
  document.querySelector("#loadingMessage");
const errorMessage: HTMLParagraphElement | null =
  document.querySelector("#errorMessage");
const progressText = document.querySelector("#progressText");

// The search box is an <input>, and we need its .value property, which only
// exists on HTMLInputElement, not on the plain Element type that
// querySelector() normally returns. A type assertion tells TypeScript to
// treat the result as an HTMLInputElement.
const searchInput = document.querySelector(
  "#searchInput",
) as HTMLInputElement | null;

const totalCount = document.querySelector("#totalCount");
const completedCount = document.querySelector("#completedCount");
const pendingCount = document.querySelector("#pendingCount");

// Where the per-person summary is drawn.
const peopleList = document.querySelector("#peopleList");

// The way back to everybody's tasks.
const allPeopleButton = document.querySelector("#allPeopleButton");

const filterAllButton = document.querySelector("#filterAll");
const filterCompletedButton = document.querySelector("#filterCompleted");
const filterPendingButton = document.querySelector("#filterPending");

// Show the waiting message and hide any old error message.
function showLoading(): void {
  if (!loadingMessage || !errorMessage) return;

  loadingMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
}

function hideLoading(): void {
  if (!loadingMessage) return;

  loadingMessage.classList.add("hidden");
}

// Hide the waiting message and tell the user that something went wrong.
function showError(): void {
  if (!loadingMessage || !errorMessage) {
    return;
  }

  loadingMessage.classList.add("hidden");
  errorMessage.classList.remove("hidden");
}

// Ask the API for the tasks and then show them on the page.
async function loadTasks() {
  showLoading();

  try {
    // The names must be here BEFORE we draw a single row, so we wait for
    // them. Without `await` the rows would be built while `users` is
    // still empty and every name would be the fallback text.
    await loadUsers();

    const response = await fetch(TASKS_URL);

    // The answer arrives as text, so we turn it into JavaScript objects.
    // response.json() only knows it received "some value", typed any, so
    // we tell TypeScript what shape to expect with "as Task[]".
    tasks = (await response.json()) as Task[];

    hideLoading();
    updateTaskSummary();
    renderTasks();

    // The summary describes everything that was loaded, so it is drawn
    // here - where new data arrives - and NOT inside renderTasks(),
    // which runs again on every filter click and keystroke.
    renderPeopleSummary();
  } catch (error) {
    // We arrive here when a request could not be made at all, for
    // example when there is no internet connection.
    showError();
  }
}

// Ask the API for the people and keep them in `users`. This request has its
// own try/catch - a failure here is caught here, so it never reaches the
// catch inside loadTasks() and never turns into the red error message. The
// people are a bonus. The tasks are the product.
async function loadUsers() {
  try {
    const response = await fetch(USERS_URL);

    users = (await response.json()) as User[];
  } catch (error) {
    users = [];
  }
}

// Turn one userId into one name.
//
// This is our typed-parameter-and-return example: getUserName both RECEIVES
// a value (userId) and GIVES one back (a name). setFilter receives values
// but does not return one. getVisibleTasks returns one but receives
// nothing. This is the only function that does both.
function getUserName(userId: number) {
  const user: User | undefined = users.find(function (user) {
    return user.id === userId;
  });

  if (user) {
    return user.name;
  }

  return "Unknown person";

  // for (const user of users) {
  //   if (user.id === userId) {
  //     // Returning inside the loop stops the loop immediately.
  //     return user.name;
  //   }
  // }

  // return "Unknown person";
}

// Count how many of the loaded tasks belong to each person. The outer loop
// walks the people, the inner loop walks the tasks - one loop running
// inside another one.
function renderPeopleSummary(): void {
  if (!peopleList) {
    return;
  }

  let html = "";

  for (const user of users) {
    let count = 0;

    for (const task of tasks) {
      if (task.userId === user.id) {
        count++;
      }
    }

    // Ten people come back from the API but only some of them own any
    // of the tasks we loaded, so the rest are left out.
    if (count > 0) {
      let word = "tasks";

      if (count === 1) {
        word = "task";
      }

      // Every line is a button, and its id is built from the
      // person's id so we can find it again afterwards.
      let activeClass = "";

      if (selectedUserId === user.id) {
        activeClass = " active";
      }

      html += `
                <li>
                    <button class="person-button${activeClass}" id="person-${user.id}">
                        ${user.name} - ${count} ${word}
                    </button>
                </li>
            `;
    }
  }

  peopleList.innerHTML = html;

  // The buttons above did not exist one line ago. innerHTML replaced
  // them, and that also threw away any listener the old buttons had, so
  // they must be given their listeners again every single time the
  // summary is drawn.
  addPersonListeners();
}

// Give every person button its click listener. We know each button's id, so
// the querySelector we already use works here too.
function addPersonListeners(): void {
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

// Remember which person is chosen, then draw again. Clicking the person who
// is already chosen clears the choice.
function setPerson(userId: number): void {
  if (!allPeopleButton) {
    return;
  }

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

  // The counts do not change - only which button looks chosen.
  renderPeopleSummary();
  renderTasks();
}

// Count the tasks, write the numbers into the three cards, and update the
// progress sentence underneath the list. This used to be two separate
// functions, each counting completed tasks on its own - we were
// calculating the same thing twice.
function updateTaskSummary(): void {
  if (!totalCount || !completedCount || !pendingCount || !progressText) {
    return;
  }

  // let completed = 0;

  // for (const task of tasks) {
  //   if (task.completed) {
  //     completed++;
  //   }
  // }

  const completed = tasks.reduce(function (i, task) {
    if (task.completed) {
      return i + 1;
    }

    return i;
  }, 0);

  const pending = tasks.length - completed;

  totalCount.textContent = String(tasks.length);
  completedCount.textContent = String(completed);
  pendingCount.textContent = String(pending);

  progressText.textContent = `${completed} of ${tasks.length} tasks completed`;
}

// Build a smaller list that only holds the tasks the user wants to see. A
// task must pass THREE checks: the status filter, the search text, and the
// chosen person.
function getVisibleTasks(): Task[] {
  // const visibleTasks: Task[] = [];

  // The user's search text does not change while this loop is running, so
  // it is only calculated once, before the loop starts.
  const search = searchText.toLowerCase();

  return tasks.filter(function (task) {
    let matchesFilter = false;

    if (currentFilter === "all") {
      matchesFilter = true;
    } else if (currentFilter === "completed" && task.completed) {
      matchesFilter = true;
    } else if (currentFilter === "pending" && !task.completed) {
      matchesFilter = true;
    }

    const title = task.title.toLowerCase();
    const matchesSearch = title.includes(search);

    let matchesPerson = false;

    if (selectedUserId === 0) {
      matchesPerson = true;
    } else if (task.userId === selectedUserId) {
      matchesPerson = true;
    }

    return matchesFilter && matchesSearch && matchesPerson;
  });

  // for (const task of tasks) {
  //   let matchesFilter = false;

  //   if (currentFilter === "all") {
  //     matchesFilter = true;
  //   } else if (currentFilter === "completed" && task.completed) {
  //     matchesFilter = true;
  //   } else if (currentFilter === "pending" && !task.completed) {
  //     matchesFilter = true;
  //   }

  //   // Every task has a different title, so this still has to happen
  //   // inside the loop.
  //   const title = task.title.toLowerCase();
  //   const matchesSearch = title.includes(search);

  //   // The third check. While nobody is chosen this stays true for
  //   // every task, so the list behaves as it always did.
  //   let matchesPerson = false;

  //   if (selectedUserId === 0) {
  //     matchesPerson = true;
  //   } else if (task.userId === selectedUserId) {
  //     matchesPerson = true;
  //   }

  //   // All three must agree before a task is shown.
  //   if (matchesFilter && matchesSearch && matchesPerson) {
  //     visibleTasks.push(task);
  //   }
  // }
}

// Build the HTML for the visible tasks and put it on the page.
function renderTasks(): void {
  // document.querySelector() can genuinely return null at runtime, if
  // nothing on the page matches the id. We check anyway, on purpose, as
  // good practice - this guard is what makes it safe to use taskList
  // below.
  if (!taskList) {
    return;
  }

  const visibleTasks: Task[] = getVisibleTasks();

  // Three checks together can easily match nothing, so say so instead of
  // leaving an empty area on the page.
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

    // The title and the owner's name are stacked together.
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

// Remember the new filter, move the blue colour to the button the user
// clicked, and draw the list again.
function setFilter(newFilter: string, clickedButton: Element): void {
  currentFilter = newFilter;

  if (!filterAllButton || !filterCompletedButton || !filterPendingButton) {
    return;
  }

  filterAllButton.classList.remove("active");
  filterCompletedButton.classList.remove("active");
  filterPendingButton.classList.remove("active");

  clickedButton.classList.add("active");

  renderTasks();
}

if (
  filterAllButton &&
  filterCompletedButton &&
  filterPendingButton &&
  searchInput &&
  allPeopleButton
) {
  filterAllButton.addEventListener("click", function () {
    setFilter("all", filterAllButton);
  });

  filterCompletedButton.addEventListener("click", function () {
    setFilter("completed", filterCompletedButton);
  });

  filterPendingButton.addEventListener("click", function () {
    setFilter("pending", filterPendingButton);
  });

  // Redraw the list every time the user types.
  searchInput.addEventListener("input", function () {
    searchText = searchInput.value;
    renderTasks();
  });

  // The way back to everybody's tasks.
  allPeopleButton.addEventListener("click", function () {
    selectedUserId = 0;
    allPeopleButton.classList.add("active");

    renderPeopleSummary();
    renderTasks();
  });
}

// Start the application.
loadTasks();
