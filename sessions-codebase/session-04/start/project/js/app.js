/* TaskFlow
   Our tasks are not written in this file any more.
   We ask an API for them every time the page opens. */

// The address we ask for our tasks.
// CORE homework: 50 instead of 15, so the tasks belong to more than one person.
const API_URL = "https://jsonplaceholder.typicode.com/todos?_limit=50";

// CORE homework: the second address, the one that knows the people.
const USERS_URL = "https://jsonplaceholder.typicode.com/users";

// The tasks we received from the API. The list starts empty.
let tasks = [];

// CORE homework: the people we received from the API. Also starts empty.
let users = [];

// Which filter the user selected: "all", "completed" or "pending".
let currentFilter = "all";

// ALREADY IN THE PROJECT (Session 2 homework):
// the words the user typed in the search box.
let searchText = "";

// CHALLENGE homework: which person the user clicked in the summary.
// 0 means "nobody is chosen", so every person's tasks are shown.
let selectedUserId = 0;

// The parts of the page that JavaScript needs to change.
const taskList = document.querySelector("#taskList");
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");

// ALREADY IN THE PROJECT (Session 2 homework).
const progressText = document.querySelector("#progressText");
const searchInput = document.querySelector("#searchInput");

const totalCount = document.querySelector("#totalCount");
const completedCount = document.querySelector("#completedCount");
const pendingCount = document.querySelector("#pendingCount");

// STRETCH homework: where the per-person summary is drawn.
const peopleList = document.querySelector("#peopleList");

// CHALLENGE homework: the way back to everybody's tasks.
const allPeopleButton = document.querySelector("#allPeopleButton");

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
        // CORE homework: the names must be here BEFORE we draw a single row,
        // so we wait for them. Without `await` the rows would be built while
        // `users` is still empty and every name would be the fallback text.
        await loadUsers();

        const response = await fetch(API_URL);

        // The answer arrives as text, so we turn it into JavaScript objects.
        tasks = await response.json();

        hideLoading();
        updateStats();
        renderTasks();
        updateProgressText();

        // STRETCH homework: the summary describes everything that was loaded,
        // so it is drawn here - where new data arrives - and NOT inside
        // renderTasks(), which runs again on every filter click and keystroke.
        renderPeopleSummary();
    } catch (error) {
        // We arrive here when a request could not be made at all,
        // for example when there is no internet connection.
        showError();
    }
}


// CORE homework: ask the API for the people and keep them in `users`.
// STRETCH homework: this request now has its OWN try/catch. That is the whole
// robustness change - a failure here is caught here, so it never reaches the
// catch inside loadTasks() and never turns into the red error message.
// The people are a bonus. The tasks are the product.
async function loadUsers() {
    try {
        const response = await fetch(USERS_URL);

        users = await response.json();
    } catch (error) {
        users = [];
    }
}


// CORE homework: turn one userId into one name.
// This function receives a value and gives a value back, which is new -
// `setFilter` receives values but does not return one, and `getVisibleTasks`
// returns one but receives nothing.
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


// STRETCH homework: count how many of the loaded tasks belong to each person.
// The outer loop walks the people, the inner loop walks the tasks. That is the
// new idea here: one loop running inside another one.
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

            // CHALLENGE homework: the line is now a button, and its id is
            // built from the person's id so we can find it again afterwards.
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

    // CHALLENGE homework: the buttons above did not exist one line ago.
    // innerHTML replaced them, and that also threw away any listener the old
    // buttons had, so they must be given their listeners again every single
    // time the summary is drawn.
    addPersonListeners();
}


// CHALLENGE homework: give every person button its click listener.
// We know each button's id, so the querySelector we already use works here too.
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


// CHALLENGE homework: remember which person is chosen, then draw again.
// Clicking the person who is already chosen clears the choice.
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

    // The counts do not change - only which button looks chosen.
    renderPeopleSummary();
    renderTasks();
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


// ALREADY IN THE PROJECT (Session 2 homework):
// the sentence under the list, for example "22 of 50 tasks completed".
function updateProgressText() {
    let completed = 0;

    for (const task of tasks) {
        if (task.completed) {
            completed++;
        }
    }

    progressText.textContent = `${completed} of ${tasks.length} tasks completed`;
}


// Build a smaller list that only holds the tasks the user wants to see.
// A task must now pass THREE checks: the status filter, the search text and
// (CHALLENGE homework) the chosen person.
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

        // ALREADY IN THE PROJECT (Session 2 homework): the search check.
        // Both sides are made lower case so capital letters do not matter.
        const title = task.title.toLowerCase();
        const search = searchText.toLowerCase();
        const matchesSearch = title.includes(search);

        // CHALLENGE homework: the third check. While nobody is chosen this
        // stays true for every task, so the list behaves as it always did.
        let matchesPerson = false;

        if (selectedUserId === 0) {
            matchesPerson = true;
        } else if (task.userId === selectedUserId) {
            matchesPerson = true;
        }

        // All three must agree before a task is shown.
        if (matchesFilter && matchesSearch && matchesPerson) {
            visibleTasks.push(task);
        }
    }

    return visibleTasks;
}


// Build the HTML for the visible tasks and put it on the page.
function renderTasks() {
    const visibleTasks = getVisibleTasks();

    // CHALLENGE homework: three checks together can easily match nothing,
    // so say so instead of leaving an empty area on the page.
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

        // CORE homework: the title and the owner's name are stacked together.
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


// ALREADY IN THE PROJECT (Session 2 homework):
// redraw the list every time the user types.
searchInput.addEventListener("input", function () {
    searchText = searchInput.value;
    renderTasks();
});


// CHALLENGE homework: the way back to everybody's tasks.
allPeopleButton.addEventListener("click", function () {
    selectedUserId = 0;
    allPeopleButton.classList.add("active");

    renderPeopleSummary();
    renderTasks();
});


// Start the application.
loadTasks();
