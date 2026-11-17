
/* =====================================================
   STUDYFLOW
   JavaScript - Student Productivity Hub
   ===================================================== */


/* ================= 1. INITIAL SETTINGS ================= */

const STORAGE_KEY = "studyflow_data";

const defaultData = {
    profile: {
        name: "Student",
        email: ""
    },

    schedules: [],
    tasks: [],
    goals: [],
    notes: [],

    sessions: [],

    settings: {
        theme: "lavender",
        schoolDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
        ],
        taskReminders: true,
        scheduleReminders: true
    },

    timer: {
        focus: 25,
        short: 5,
        long: 15
    }
};


// Load data from LocalStorage
function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return structuredClone(defaultData);
        }

        const parsedData = JSON.parse(savedData);

        return {
            ...structuredClone(defaultData),
            ...parsedData,

            profile: {
                ...defaultData.profile,
                ...parsedData.profile
            },

            settings: {
                ...defaultData.settings,
                ...parsedData.settings
            },

            timer: {
                ...defaultData.timer,
                ...parsedData.timer
            },

            schedules: Array.isArray(parsedData.schedules)
                ? parsedData.schedules : [],

            tasks: Array.isArray(parsedData.tasks)
                ? parsedData.tasks : [],

            goals: Array.isArray(parsedData.goals)
                ? parsedData.goals : [],

            notes: Array.isArray(parsedData.notes)
                ? parsedData.notes : [],

            sessions: Array.isArray(parsedData.sessions)
                ? parsedData.sessions : []
        };

    } catch (error) {
        console.error("Unable to load StudyFlow data:", error);
        return structuredClone(defaultData);
    }
}


let appData = loadData();


// Save data
function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );
    } catch (error) {
        console.error("Unable to save StudyFlow data:", error);
        alert("Data could not be saved. Check your browser storage.");
    }
}


// Generate unique ID
function generateId() {
    return Date.now().toString(36) +
        Math.random().toString(36).substring(2, 9);
}


// HTML safety
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


// Refresh Lucide icons
function refreshIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}


// Format date
function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// Get today's date in local format
function getTodayString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Get weekday
function getTodayName() {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long"
    }).format(new Date());
}


// Format time
function formatTime(time) {
    if (!time) return "";

    return time;
}


// ================= 2. NAVIGATION =================

const sidebar = document.getElementById("sidebar");

const navLinks = document.querySelectorAll(".nav-link");

const pageSections = document.querySelectorAll(".page-section");

const breadcrumbTitle = document.getElementById("breadcrumb-title");


function showPage(pageName) {

    const targetPage = document.getElementById(pageName);

    if (!targetPage) return;

    pageSections.forEach(section => {
        section.classList.remove("active");
    });

    targetPage.classList.add("active");

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageName
        );
    });

    const activeLink = document.querySelector(
        `.nav-link[data-page="${pageName}"]`
    );

    if (breadcrumbTitle && activeLink) {
        breadcrumbTitle.textContent =
            activeLink.querySelector("span").textContent;
    }

    sidebar?.classList.remove("open");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    history.replaceState(null, "", `#${pageName}`);

    refreshIcons();
}


// Sidebar navigation
navLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        showPage(link.dataset.page);

    });

});


// Navigation buttons inside dashboard
document.querySelectorAll("[data-navigate]").forEach(button => {

    button.addEventListener("click", () => {

        showPage(button.dataset.navigate);

    });

});


// Mobile sidebar
const mobileMenuButton = document.getElementById(
    "mobile-menu-button"
);

mobileMenuButton?.addEventListener("click", () => {

    sidebar?.classList.toggle("open");

});


// Close sidebar when clicking outside
document.addEventListener("click", event => {

    if (!sidebar || !sidebar.classList.contains("open")) return;

    if (
        !sidebar.contains(event.target) &&
        !mobileMenuButton?.contains(event.target)
    ) {
        sidebar.classList.remove("open");
    }

});


// Open page from URL hash
function initializeNavigation() {

    const requestedPage = location.hash.replace("#", "");

    const validPages = [
        "dashboard",
        "schedule",
        "tasks",
        "progress",
        "notes",
        "timer",
        "settings"
    ];

    if (validPages.includes(requestedPage)) {
        showPage(requestedPage);
    }

}



// ================= 3. MODAL SYSTEM =================

function openModal(modalId) {

    const modal = document.getElementById(modalId);

    if (!modal) return;

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

    refreshIcons();

}


function closeModal(modalId) {

    const modal = document.getElementById(modalId);

    if (!modal) return;

    modal.classList.remove("active");

    document.body.style.overflow = "";

}


// Close buttons
document.querySelectorAll("[data-close]").forEach(button => {

    button.addEventListener("click", () => {

        closeModal(button.dataset.close);

    });

});


// Close modal by clicking outside
document.querySelectorAll(".modal-overlay").forEach(modal => {

    modal.addEventListener("click", event => {

        if (event.target === modal) {
            closeModal(modal.id);
        }

    });

});


// Close modal using Escape
document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        document.querySelectorAll(".modal-overlay.active").forEach(modal => {
            closeModal(modal.id);
        });

    }

});



// ================= 4. DASHBOARD =================

function renderDashboard() {

    updateWelcomeMessage();

    updateDashboardStatistics();

    renderDashboardSchedules();

    renderDashboardTasks();

    updateDailyProgress();

    renderWeeklyOverview();

}


// Welcome message
function updateWelcomeMessage() {

    const name = appData.profile.name || "Student";

    const welcomeName = document.getElementById("welcome-name");

    const sidebarUsername = document.querySelector(".sidebar-username");

    const topbarUsername = document.getElementById("topbar-username");

    const currentDate = document.getElementById("current-date");

    if (welcomeName) welcomeName.textContent = name;

    if (sidebarUsername) sidebarUsername.textContent = name;

    if (topbarUsername) topbarUsername.textContent = name;

    if (currentDate) {

        currentDate.textContent = new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    }

}


// Dashboard statistics
function updateDashboardStatistics() {

    const today = getTodayName();

    const totalSchedules = appData.schedules.length;

    const totalTasks = appData.tasks.length;

    const completedTasks = appData.tasks.filter(
        task => task.status === "Completed"
    ).length;

    const totalMinutes = appData.sessions.reduce(
        (sum, session) => sum + Number(session.minutes || 0),
        0
    );

    const studyHours = (totalMinutes / 60).toFixed(1);

    document.getElementById("total-schedules").textContent =
        totalSchedules;

    document.getElementById("total-tasks").textContent =
        totalTasks;

    document.getElementById("completed-tasks").textContent =
        completedTasks;

    document.getElementById("study-hours").textContent =
        `${studyHours}h`;

}


// Today's schedules
function renderDashboardSchedules() {

    const container = document.getElementById(
        "dashboard-schedules"
    );

    if (!container) return;

    const today = getTodayName();

    const schedules = appData.schedules
        .filter(schedule => schedule.day === today)
        .sort((a, b) => a.start.localeCompare(b.start));

    if (schedules.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calendar-days"></i>
                <p>No schedules yet</p>
                <span>Add your first schedule to get started.</span>
            </div>
        `;

        refreshIcons();
        return;

    }

    container.innerHTML = schedules.map(schedule => `

        <div class="dashboard-schedule-item">

            <div class="schedule-time">
                <strong>${escapeHTML(schedule.start)}</strong>
                <span>${escapeHTML(schedule.end)}</span>
            </div>

            <div class="schedule-item-info">
                <h4>${escapeHTML(schedule.name)}</h4>
                <p>${escapeHTML(schedule.category)}</p>
            </div>

        </div>

    `).join("");

    refreshIcons();

}


// Upcoming tasks
function renderDashboardTasks() {

    const container = document.getElementById(
        "dashboard-tasks"
    );

    if (!container) return;

    const tasks = [...appData.tasks]
        .filter(task => task.status !== "Completed")
        .sort((a, b) => {

            if (!a.deadline) return 1;
            if (!b.deadline) return -1;

            return a.deadline.localeCompare(b.deadline);

        })
        .slice(0, 5);

    if (tasks.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="clipboard-list"></i>
                <p>No upcoming tasks</p>
                <span>Your tasks will appear here.</span>
            </div>
        `;

        refreshIcons();
        return;

    }

    container.innerHTML = tasks.map(task => `

        <div class="dashboard-task-item">

            <div class="task-item-info">
                <h4>${escapeHTML(task.name)}</h4>
                <p>${escapeHTML(task.subject || "Personal Task")}</p>
            </div>

            <span class="task-priority priority-${task.priority.toLowerCase()}">
                ${escapeHTML(task.priority)}
            </span>

        </div>

    `).join("");

    refreshIcons();

}


// Daily progress
function updateDailyProgress() {

    const today = getTodayString();

    const todayTasks = appData.tasks.filter(
        task => task.deadline === today
    );

    let percentage = 0;

    if (todayTasks.length > 0) {

        const completed = todayTasks.filter(
            task => task.status === "Completed"
        ).length;

        percentage = Math.round(
            completed / todayTasks.length * 100
        );

    }

    const progressText = document.getElementById(
        "daily-progress"
    );

    const progressCircle = document.getElementById(
        "daily-progress-circle"
    );

    if (progressText) {
        progressText.textContent = `${percentage}%`;
    }

    if (progressCircle) {

        progressCircle.style.background = `
            conic-gradient(
                var(--primary) ${percentage * 3.6}deg,
                #EEEAF4 ${percentage * 3.6}deg
            )
        `;

    }

}


// Weekly overview
function renderWeeklyOverview() {

    const container = document.getElementById(
        "weekly-overview"
    );

    if (!container) return;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const today = new Date();

    const dayIndex = (today.getDay() + 6) % 7;

    const monday = new Date(today);

    monday.setDate(today.getDate() - dayIndex);

    const weeklyData = days.map((day, index) => {

        const date = new Date(monday);

        date.setDate(monday.getDate() + index);

        const dateString = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");

        const minutes = appData.sessions
            .filter(session => session.date === dateString)
            .reduce((sum, session) => sum + Number(session.minutes || 0), 0);

        return {
            day,
            minutes
        };

    });

    const maxMinutes = Math.max(
        ...weeklyData.map(item => item.minutes),
        60
    );

    container.innerHTML = `

        <div class="weekly-bars">

            ${weeklyData.map(item => {

                const height = Math.max(
                    5,
                    item.minutes / maxMinutes * 100
                );

                return `

                    <div class="weekly-bar-item">

                        <div class="weekly-bar-track">

                            <div
                                class="weekly-bar-fill"
                                style="height: ${height}%"
                                title="${item.minutes} minutes"
                            ></div>

                        </div>

                        <span>${item.day}</span>

                    </div>

                `;

            }).join("")}

        </div>

    `;

}



// ================= 5. SCHEDULE MANAGEMENT =================

const scheduleForm = document.getElementById("schedule-form");

const scheduleModal = document.getElementById("schedule-modal");

const addScheduleButton = document.getElementById(
    "add-schedule-button"
);

let currentScheduleView = "week";

let schedulePeriodOffset = 0;


// Open schedule form
addScheduleButton?.addEventListener("click", () => {

    scheduleForm.reset();

    document.getElementById("schedule-id").value = "";

    document.getElementById("schedule-modal-title").textContent =
        "Add Schedule";

    openModal("schedule-modal");

});


// Save schedule
scheduleForm?.addEventListener("submit", event => {

    event.preventDefault();

    const id = document.getElementById("schedule-id").value;

    const schedule = {

        id: id || generateId(),

        name: document.getElementById("schedule-name").value.trim(),

        day: document.getElementById("schedule-day").value,

        category: document.getElementById("schedule-category").value,

        start: document.getElementById("schedule-start").value,

        end: document.getElementById("schedule-end").value,

        notes: document.getElementById("schedule-notes").value.trim()

    };


    if (schedule.start >= schedule.end) {

        alert("End time must be later than start time.");

        return;

    }


    if (id) {

        appData.schedules = appData.schedules.map(item =>
            item.id === id ? schedule : item
        );

    } else {

        appData.schedules.push(schedule);

    }


    saveData();

    renderAll();

    closeModal("schedule-modal");

});


// Schedule view buttons
document.querySelectorAll("[data-view]").forEach(button => {

    button.addEventListener("click", () => {

        currentScheduleView = button.dataset.view;

        document.querySelectorAll("[data-view]").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        schedulePeriodOffset = 0;

        renderSchedule();

    });

});


// Previous and next period
document.getElementById("previous-period")?.addEventListener(
    "click",
    () => {

        schedulePeriodOffset--;

        renderSchedule();

    }
);


document.getElementById("next-period")?.addEventListener(
    "click",
    () => {

        schedulePeriodOffset++;

        renderSchedule();

    }
);


// Render schedules
function renderSchedule() {

    const container = document.getElementById(
        "schedule-container"
    );

    const periodTitle = document.getElementById(
        "calendar-period"
    );

    if (!container) return;

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    let selectedDays = days;

    if (currentScheduleView === "day") {

        selectedDays = [getTodayName()];

    }


    if (currentScheduleView === "month") {

        periodTitle.textContent = "All Schedules";

    } else if (currentScheduleView === "day") {

        periodTitle.textContent = getTodayName();

    } else {

        periodTitle.textContent = "Weekly Schedule";

    }


    let filteredSchedules = [...appData.schedules];

    if (currentScheduleView !== "month") {

        filteredSchedules = filteredSchedules.filter(
            schedule => selectedDays.includes(schedule.day)
        );

    }


    if (filteredSchedules.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calendar"></i>
                <p>No schedules available</p>
                <span>Add your activities to organize your time.</span>
            </div>
        `;

        refreshIcons();
        return;

    }


    if (currentScheduleView === "month") {

        container.innerHTML = `
            <div class="schedule-week-list">

                ${filteredSchedules
                    .sort((a, b) => {

                        const dayDifference =
                            days.indexOf(a.day) - days.indexOf(b.day);

                        if (dayDifference !== 0) return dayDifference;

                        return a.start.localeCompare(b.start);

                    })
                    .map(schedule => renderScheduleItem(schedule))
                    .join("")}

            </div>
        `;

    } else {

        container.innerHTML = selectedDays.map(day => {

            const daySchedules = filteredSchedules
                .filter(schedule => schedule.day === day)
                .sort((a, b) => a.start.localeCompare(b.start));

            return `

                <div class="schedule-day-group">

                    <div class="schedule-day-heading">
                        <h3>${day}</h3>
                        <span>${daySchedules.length} activities</span>
                    </div>

                    <div class="schedule-day-items">

                        ${daySchedules.length > 0
                            ? daySchedules.map(renderScheduleItem).join("")
                            : `<p class="empty-description">No activities scheduled.</p>`
                        }

                    </div>

                </div>

            `;

        }).join("");

    }

    refreshIcons();

}


function renderScheduleItem(schedule) {

    return `

        <div class="schedule-entry">

            <div class="schedule-entry-time">
                <strong>${escapeHTML(schedule.start)}</strong>
                <span>${escapeHTML(schedule.end)}</span>
            </div>

            <div class="schedule-entry-details">
                <h4>${escapeHTML(schedule.name)}</h4>
                <p>${escapeHTML(schedule.category)}</p>
                ${schedule.notes
                    ? `<small>${escapeHTML(schedule.notes)}</small>`
                    : ""
                }
            </div>

            <div class="item-actions">

                <button
                    class="icon-button edit-schedule"
                    data-id="${escapeHTML(schedule.id)}"
                    type="button"
                    aria-label="Edit schedule"
                >
                    <i data-lucide="pencil"></i>
                </button>

                <button
                    class="icon-button delete-schedule"
                    data-id="${escapeHTML(schedule.id)}"
                    type="button"
                    aria-label="Delete schedule"
                >
                    <i data-lucide="trash-2"></i>
                </button>

            </div>

        </div>

    `;

}


// Edit and delete schedule
document.getElementById("schedule-container")?.addEventListener(
    "click",
    event => {

        const editButton = event.target.closest(".edit-schedule");

        const deleteButton = event.target.closest(".delete-schedule");


        if (editButton) {

            const schedule = appData.schedules.find(
                item => item.id === editButton.dataset.id
            );

            if (!schedule) return;

            document.getElementById("schedule-id").value = schedule.id;

            document.getElementById("schedule-name").value = schedule.name;

            document.getElementById("schedule-day").value = schedule.day;

            document.getElementById("schedule-category").value =
                schedule.category;

            document.getElementById("schedule-start").value =
                schedule.start;

            document.getElementById("schedule-end").value =
                schedule.end;

            document.getElementById("schedule-notes").value =
                schedule.notes || "";

            document.getElementById("schedule-modal-title").textContent =
                "Edit Schedule";

            openModal("schedule-modal");

        }


        if (deleteButton) {

            const confirmed = confirm(
                "Are you sure you want to delete this schedule?"
            );

            if (!confirmed) return;

            appData.schedules = appData.schedules.filter(
                item => item.id !== deleteButton.dataset.id
            );

            saveData();

            renderAll();

        }

    }
);



// ================= 6. TASK MANAGEMENT =================

const taskForm = document.getElementById("task-form");

const addTaskButton = document.getElementById("add-task-button");

let currentTaskFilter = "all";

let taskSearchQuery = "";


// Open task modal
addTaskButton?.addEventListener("click", () => {

    taskForm.reset();

    document.getElementById("task-id").value = "";

    document.getElementById("task-modal-title").textContent =
        "Add New Task";

    openModal("task-modal");

});


// Save task
taskForm?.addEventListener("submit", event => {

    event.preventDefault();

    const id = document.getElementById("task-id").value;

    const task = {

        id: id || generateId(),

        name: document.getElementById("task-name").value.trim(),

        subject: document.getElementById("task-subject").value.trim(),

        description: document.getElementById("task-description").value.trim(),

        deadline: document.getElementById("task-deadline").value,

        priority: document.getElementById("task-priority").value,

        status: document.getElementById("task-status").value

    };


    if (id) {

        appData.tasks = appData.tasks.map(item =>
            item.id === id ? task : item
        );

    } else {

        appData.tasks.push(task);

    }


    saveData();

    renderAll();

    closeModal("task-modal");

});


// Task filter buttons
document.querySelectorAll("[data-filter]").forEach(button => {

    button.addEventListener("click", () => {

        currentTaskFilter = button.dataset.filter;

        document.querySelectorAll("[data-filter]").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();

    });

});


// Task search
document.getElementById("task-search")?.addEventListener(
    "input",
    event => {

        taskSearchQuery = event.target.value.toLowerCase();

        renderTasks();

    }
);


// Update task statistics
function updateTaskStatistics() {

    const all = appData.tasks.length;

    const todo = appData.tasks.filter(
        task => task.status === "To Do"
    ).length;

    const progress = appData.tasks.filter(
        task => task.status === "In Progress"
    ).length;

    const completed = appData.tasks.filter(
        task => task.status === "Completed"
    ).length;


    document.getElementById("all-task-count").textContent = all;

    document.getElementById("todo-task-count").textContent = todo;

    document.getElementById("progress-task-count").textContent = progress;

    document.getElementById("completed-task-count").textContent = completed;

}


// Render tasks
function renderTasks() {

    const container = document.getElementById("task-container");

    if (!container) return;

    let tasks = [...appData.tasks];


    if (currentTaskFilter === "todo") {

        tasks = tasks.filter(task => task.status === "To Do");

    } else if (currentTaskFilter === "progress") {

        tasks = tasks.filter(task => task.status === "In Progress");

    } else if (currentTaskFilter === "completed") {

        tasks = tasks.filter(task => task.status === "Completed");

    }


    if (taskSearchQuery) {

        tasks = tasks.filter(task => {

            return (
                task.name.toLowerCase().includes(taskSearchQuery) ||
                (task.subject || "").toLowerCase().includes(taskSearchQuery)
            );

        });

    }


    if (tasks.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="clipboard-list"></i>
                <p>No tasks found</p>
                <span>Try another filter or create a new task.</span>
            </div>
        `;

        updateTaskStatistics();
        refreshIcons();
        return;

    }


    container.innerHTML = tasks.map(task => `

        <div class="task-card">

            <div class="task-card-main">

                <div class="task-card-info">

                    <h4>${escapeHTML(task.name)}</h4>

                    <p>${escapeHTML(task.subject || "Personal Task")}</p>

                    ${task.description
                        ? `<small>${escapeHTML(task.description)}</small>`
                        : ""
                    }

                </div>

                <span class="task-priority priority-${task.priority.toLowerCase()}">
                    ${escapeHTML(task.priority)}
                </span>

            </div>


            <div class="task-card-bottom">

                <div class="task-deadline">
                    <i data-lucide="calendar"></i>
                    <span>${formatDate(task.deadline)}</span>
                </div>


                <div class="task-card-actions">

                    <select
                        class="task-status-select"
                        data-id="${escapeHTML(task.id)}"
                        aria-label="Change task status"
                    >

                        <option value="To Do" ${task.status === "To Do" ? "selected" : ""}>
                            To Do
                        </option>

                        <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>
                            In Progress
                        </option>

                        <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>
                            Completed
                        </option>

                    </select>


                    <button
                        class="icon-button edit-task"
                        data-id="${escapeHTML(task.id)}"
                        type="button"
                        aria-label="Edit task"
                    >
                        <i data-lucide="pencil"></i>
                    </button>


                    <button
                        class="icon-button delete-task"
                        data-id="${escapeHTML(task.id)}"
                        type="button"
                        aria-label="Delete task"
                    >
                        <i data-lucide="trash-2"></i>
                    </button>

                </div>

            </div>

        </div>

    `).join("");


    updateTaskStatistics();

    refreshIcons();

}


// Edit and delete tasks
document.getElementById("task-container")?.addEventListener(
    "click",
    event => {

        const editButton = event.target.closest(".edit-task");

        const deleteButton = event.target.closest(".delete-task");


        if (editButton) {

            const task = appData.tasks.find(
                item => item.id === editButton.dataset.id
            );

            if (!task) return;

            document.getElementById("task-id").value = task.id;

            document.getElementById("task-name").value = task.name;

            document.getElementById("task-subject").value =
                task.subject || "";

            document.getElementById("task-description").value =
                task.description || "";

            document.getElementById("task-deadline").value =
                task.deadline || "";

            document.getElementById("task-priority").value =
                task.priority;

            document.getElementById("task-status").value =
                task.status;

            document.getElementById("task-modal-title").textContent =
                "Edit Task";

            openModal("task-modal");

        }


        if (deleteButton) {

            if (!confirm("Delete this task?")) return;

            appData.tasks = appData.tasks.filter(
                item => item.id !== deleteButton.dataset.id
            );

            saveData();

            renderAll();

        }

    }
);


// Change task status
document.getElementById("task-container")?.addEventListener(
    "change",
    event => {

        if (!event.target.matches(".task-status-select")) return;

        const id = event.target.dataset.id;

        const task = appData.tasks.find(item => item.id === id);

        if (!task) return;

        task.status = event.target.value;

        saveData();

        renderAll();

    }
);



// ================= 7. LEARNING GOALS =================

const goalForm = document.getElementById("goal-form");

const addGoalButton = document.getElementById("add-goal-button");


// Open goal modal
addGoalButton?.addEventListener("click", () => {

    goalForm.reset();

    document.getElementById("goal-id").value = "";

    document.getElementById("goal-progress").value = 0;

    document.getElementById("goal-progress-value").textContent = 0;

    document.getElementById("goal-modal-title").textContent =
        "Add Learning Goal";

    openModal("goal-modal");

});


// Update displayed goal percentage
document.getElementById("goal-progress")?.addEventListener(
    "input",
    event => {

        document.getElementById("goal-progress-value").textContent =
            event.target.value;

    }
);


// Save goal
goalForm?.addEventListener("submit", event => {

    event.preventDefault();

    const id = document.getElementById("goal-id").value;

    const goal = {

        id: id || generateId(),

        name: document.getElementById("goal-name").value.trim(),

        description: document.getElementById("goal-description").value.trim(),

        deadline: document.getElementById("goal-deadline").value,

        progress: Number(
            document.getElementById("goal-progress").value
        )

    };


    if (id) {

        appData.goals = appData.goals.map(item =>
            item.id === id ? goal : item
        );

    } else {

        appData.goals.push(goal);

    }


    saveData();

    renderAll();

    closeModal("goal-modal");

});


// Render goals
function renderGoals() {

    const container = document.getElementById("goals-container");

    if (!container) return;

    const total = appData.goals.length;

    const completed = appData.goals.filter(
        goal => goal.progress >= 100
    ).length;

    const average = total > 0
        ? Math.round(
            appData.goals.reduce(
                (sum, goal) => sum + goal.progress,
                0
            ) / total
        )
        : 0;


    document.getElementById("total-goals").textContent = total;

    document.getElementById("completed-goals").textContent = completed;

    document.getElementById("average-progress").textContent =
        `${average}%`;


    if (total === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="target"></i>
                <p>No learning goals yet</p>
                <span>Create your first learning goal.</span>
            </div>
        `;

        refreshIcons();
        return;

    }


    container.innerHTML = appData.goals.map(goal => `

        <div class="goal-card">

            <div class="goal-heading">

                <h4>${escapeHTML(goal.name)}</h4>

                <div class="item-actions">

                    <button
                        class="icon-button edit-goal"
                        data-id="${escapeHTML(goal.id)}"
                        type="button"
                        aria-label="Edit goal"
                    >
                        <i data-lucide="pencil"></i>
                    </button>

                    <button
                        class="icon-button delete-goal"
                        data-id="${escapeHTML(goal.id)}"
                        type="button"
                        aria-label="Delete goal"
                    >
                        <i data-lucide="trash-2"></i>
                    </button>

                </div>

            </div>


            <p>${escapeHTML(goal.description || "Personal learning goal")}</p>

            <div class="goal-progress-track">

                <div
                    class="goal-progress-fill"
                    style="width: ${goal.progress}%"
                ></div>

            </div>


            <div class="goal-progress-label">

                <span>${goal.progress}% completed</span>

                <span>${formatDate(goal.deadline)}</span>

            </div>

        </div>

    `).join("");

    refreshIcons();

}


// Edit and delete goals
document.getElementById("goals-container")?.addEventListener(
    "click",
    event => {

        const editButton = event.target.closest(".edit-goal");

        const deleteButton = event.target.closest(".delete-goal");


        if (editButton) {

            const goal = appData.goals.find(
                item => item.id === editButton.dataset.id
            );

            if (!goal) return;

            document.getElementById("goal-id").value = goal.id;

            document.getElementById("goal-name").value = goal.name;

            document.getElementById("goal-description").value =
                goal.description || "";

            document.getElementById("goal-deadline").value =
                goal.deadline || "";

            document.getElementById("goal-progress").value =
                goal.progress;

            document.getElementById("goal-progress-value").textContent =
                goal.progress;

            document.getElementById("goal-modal-title").textContent =
                "Edit Learning Goal";

            openModal("goal-modal");

        }


        if (deleteButton) {

            if (!confirm("Delete this learning goal?")) return;

            appData.goals = appData.goals.filter(
                item => item.id !== deleteButton.dataset.id
            );

            saveData();

            renderAll();

        }

    }
);



// ================= 8. NOTES MANAGEMENT =================

const noteForm = document.getElementById("note-form");

const addNoteButton = document.getElementById("add-note-button");

let noteSearchQuery = "";

let noteCategoryFilter = "all";


// Open note modal
addNoteButton?.addEventListener("click", () => {

    noteForm.reset();

    document.getElementById("note-id").value = "";

    document.getElementById("note-modal-title").textContent =
        "Create New Note";

    openModal("note-modal");

});


// Save note
noteForm?.addEventListener("submit", event => {

    event.preventDefault();

    const id = document.getElementById("note-id").value;

    const existingNote = appData.notes.find(
        note => note.id === id
    );

    const note = {

        id: id || generateId(),

        title: document.getElementById("note-title").value.trim(),

        category: document.getElementById("note-category").value,

        content: document.getElementById("note-content").value.trim(),

        updatedAt: new Date().toISOString()

    };


    if (existingNote) {

        appData.notes = appData.notes.map(item =>
            item.id === id ? note : item
        );

    } else {

        appData.notes.push(note);

    }


    saveData();

    renderNotes();

    closeModal("note-modal");

});


// Note search
document.getElementById("note-search")?.addEventListener(
    "input",
    event => {

        noteSearchQuery = event.target.value.toLowerCase();

        renderNotes();

    }
);


// Note category filter
document.getElementById("note-category-filter")?.addEventListener(
    "change",
    event => {

        noteCategoryFilter = event.target.value;

        renderNotes();

    }
);


// Render notes
function renderNotes() {

    const container = document.getElementById("notes-container");

    if (!container) return;

    let notes = [...appData.notes];


    if (noteSearchQuery) {

        notes = notes.filter(note => {

            return (
                note.title.toLowerCase().includes(noteSearchQuery) ||
                note.content.toLowerCase().includes(noteSearchQuery)
            );

        });

    }


    if (noteCategoryFilter !== "all") {

        notes = notes.filter(
            note => note.category === noteCategoryFilter
        );

    }


    if (notes.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="notebook-pen"></i>
                <p>No notes found</p>
                <span>Create a note or try another search.</span>
            </div>
        `;

        refreshIcons();
        return;

    }


    container.innerHTML = notes.map(note => `

        <div class="note-card">

            <div class="note-card-content">

                <span class="note-category">
                    ${escapeHTML(note.category)}
                </span>

                <h4>${escapeHTML(note.title)}</h4>

                <p>${escapeHTML(note.content)}</p>

            </div>


            <div class="item-actions">

                <button
                    class="icon-button edit-note"
                    data-id="${escapeHTML(note.id)}"
                    type="button"
                    aria-label="Edit note"
                >
                    <i data-lucide="pencil"></i>
                </button>

                <button
                    class="icon-button delete-note"
                    data-id="${escapeHTML(note.id)}"
                    type="button"
                    aria-label="Delete note"
                >
                    <i data-lucide="trash-2"></i>
                </button>

            </div>

        </div>

    `).join("");

    refreshIcons();

}


// Edit and delete notes
document.getElementById("notes-container")?.addEventListener(
    "click",
    event => {

        const editButton = event.target.closest(".edit-note");

        const deleteButton = event.target.closest(".delete-note");


        if (editButton) {

            const note = appData.notes.find(
                item => item.id === editButton.dataset.id
            );

            if (!note) return;

            document.getElementById("note-id").value = note.id;

            document.getElementById("note-title").value = note.title;

            document.getElementById("note-category").value =
                note.category;

            document.getElementById("note-content").value =
                note.content;

            document.getElementById("note-modal-title").textContent =
                "Edit Note";

            openModal("note-modal");

        }


        if (deleteButton) {

            if (!confirm("Delete this note?")) return;

            appData.notes = appData.notes.filter(
                item => item.id !== deleteButton.dataset.id
            );

            saveData();

            renderNotes();

        }

    }
);



// ================= 9. POMODORO TIMER =================

let timerMode = "focus";

let remainingSeconds = 25 * 60;

let timerInterval = null;

let timerRunning = false;


const timerDisplay = document.getElementById("timer-display");

const timerStatus = document.getElementById("timer-status");

const timerStartButton = document.getElementById("timer-start");


// Get timer duration
function getTimerDuration(mode) {

    const minutes = appData.timer[mode] || 25;

    return Number(minutes) * 60;

}


// Update timer display
function updateTimerDisplay() {

    const minutes = Math.floor(remainingSeconds / 60);

    const seconds = remainingSeconds % 60;

    if (timerDisplay) {

        timerDisplay.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    }

}


// Update timer status
function updateTimerStatus() {

    if (!timerStatus) return;

    const messages = {

        focus: "Time to focus!",

        short: "Take a short break.",

        long: "Enjoy your long break."

    };

    timerStatus.textContent = messages[timerMode];

}


// Select timer mode
function setTimerMode(mode) {

    if (timerRunning) return;

    timerMode = mode;

    remainingSeconds = getTimerDuration(mode);

    document.querySelectorAll(".timer-mode").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );

    });

    updateTimerDisplay();

    updateTimerStatus();

}


// Timer mode buttons
document.querySelectorAll(".timer-mode").forEach(button => {

    button.addEventListener("click", () => {

        setTimerMode(button.dataset.mode);

    });

});


// Save completed focus session
function saveFocusSession() {

    const session = {

        id: generateId(),

        date: getTodayString(),

        minutes: Number(appData.timer.focus)

    };

    appData.sessions.push(session);

    saveData();

    renderTimerStatistics();

    renderDashboard();

}


// Start timer
function startTimer() {

    if (timerRunning) {

        pauseTimer();

        return;

    }

    timerRunning = true;

    if (timerStartButton) {

        timerStartButton.innerHTML = `
            <i data-lucide="pause"></i>
            Pause
        `;

    }

    refreshIcons();

    timerInterval = setInterval(() => {

        remainingSeconds--;

        updateTimerDisplay();

        if (remainingSeconds <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;

            timerRunning = false;

            if (timerStartButton) {

                timerStartButton.innerHTML = `
                    <i data-lucide="play"></i>
                    Start
                `;

            }

            if (timerMode === "focus") {

                saveFocusSession();

            }

            timerStatus.textContent = "Session completed!";

            if (timerMode === "focus") {

                alert("Focus session completed. Great work!");

            } else {

                alert("Break completed. Ready for your next session?");

            }

            refreshIcons();

            return;

        }

    }, 1000);

}


// Pause timer
function pauseTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    timerRunning = false;

    if (timerStartButton) {

        timerStartButton.innerHTML = `
            <i data-lucide="play"></i>
            Resume
        `;

    }

    refreshIcons();

}


// Start/pause button
timerStartButton?.addEventListener("click", startTimer);


// Reset timer
document.getElementById("timer-reset")?.addEventListener(
    "click",
    () => {

        clearInterval(timerInterval);

        timerInterval = null;

        timerRunning = false;

        remainingSeconds = getTimerDuration(timerMode);

        updateTimerDisplay();

        updateTimerStatus();

        if (timerStartButton) {

            timerStartButton.innerHTML = `
                <i data-lucide="play"></i>
                Start
            `;

        }

        refreshIcons();

    }
);


// Timer settings
document.getElementById("timer-settings-form")?.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const focus = Number(
            document.getElementById("focus-duration").value
        );

        const short = Number(
            document.getElementById("short-duration").value
        );

        const long = Number(
            document.getElementById("long-duration").value
        );


        if (
            !Number.isInteger(focus) ||
            !Number.isInteger(short) ||
            !Number.isInteger(long) ||
            focus < 1 || focus > 180 ||
            short < 1 || short > 60 ||
            long < 1 || long > 60
        ) {

            alert("Enter valid timer durations within the allowed limits.");

            return;

        }


        appData.timer = {
            focus,
            short,
            long
        };

        saveData();

        setTimerMode(timerMode);

        alert("Timer settings saved!");

    }
);


// Timer statistics
function renderTimerStatistics() {

    const totalSessions = appData.sessions.length;

    const totalMinutes = appData.sessions.reduce(
        (sum, session) => sum + Number(session.minutes || 0),
        0
    );


    document.getElementById("total-sessions").textContent =
        totalSessions;

    document.getElementById("total-focus-time").textContent =
        `${totalMinutes} min`;


    const historyContainer = document.getElementById("timer-history");

    if (!historyContainer) return;


    if (totalSessions === 0) {

        historyContainer.innerHTML = `
            <p class="empty-description">
                Your completed study sessions will appear here.
            </p>
        `;

        return;

    }


    historyContainer.innerHTML = [...appData.sessions]
        .reverse()
        .slice(0, 10)
        .map(session => `

            <div class="timer-history-item">

                <div>
                    <strong>Focus Session</strong>
                    <p>${formatDate(session.date)}</p>
                </div>

                <span>${session.minutes} minutes</span>

            </div>

        `).join("");

}



// ================= 10. SETTINGS =================


// Load profile settings
function loadSettings() {

    document.getElementById("profile-name").value =
        appData.profile.name || "";

    document.getElementById("profile-email").value =
        appData.profile.email || "";

    document.getElementById("theme-select").value =
        appData.settings.theme || "lavender";

    document.getElementById("task-reminders").checked =
        appData.settings.taskReminders;

    document.getElementById("schedule-reminders").checked =
        appData.settings.scheduleReminders;


    document.querySelectorAll(
        'input[name="school-days"]'
    ).forEach(checkbox => {

        checkbox.checked = appData.settings.schoolDays.includes(
            checkbox.value
        );

    });


    document.getElementById("focus-duration").value =
        appData.timer.focus;

    document.getElementById("short-duration").value =
        appData.timer.short;

    document.getElementById("long-duration").value =
        appData.timer.long;


    applyTheme();

}


// Save profile
document.getElementById("profile-form")?.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        appData.profile.name =
            document.getElementById("profile-name").value.trim() || "Student";

        appData.profile.email =
            document.getElementById("profile-email").value.trim();

        saveData();

        renderDashboard();

        alert("Profile saved successfully!");

    }
);


// Theme management
function applyTheme() {

    const theme = appData.settings.theme;

    const themes = {

        lavender: {
            primary: "#9475C5",
            primaryDark: "#8060B5",
            primaryLight: "#E9E1F7",
            primarySoft: "#F3EFFA"
        },

        pink: {
            primary: "#D78EAF",
            primaryDark: "#BF7194",
            primaryLight: "#F8E3ED",
            primarySoft: "#FDF1F6"
        },

        blue: {
            primary: "#789BCF",
            primaryDark: "#5D80B4",
            primaryLight: "#E2ECF9",
            primarySoft: "#F0F5FC"
        },

        green: {
            primary: "#83A991",
            primaryDark: "#668D74",
            primaryLight: "#E3F0E6",
            primarySoft: "#F0F7F1"
        }

    };


    const selectedTheme = themes[theme] || themes.lavender;

    const root = document.documentElement;

    root.style.setProperty("--primary", selectedTheme.primary);

    root.style.setProperty("--primary-dark", selectedTheme.primaryDark);

    root.style.setProperty("--primary-light", selectedTheme.primaryLight);

    root.style.setProperty("--primary-soft", selectedTheme.primarySoft);

}


// Theme selection
document.getElementById("theme-select")?.addEventListener(
    "change",
    event => {

        appData.settings.theme = event.target.value;

        saveData();

        applyTheme();

    }
);


// School day settings
document.querySelectorAll(
    'input[name="school-days"]'
).forEach(checkbox => {

    checkbox.addEventListener("change", () => {

        appData.settings.schoolDays = Array.from(
            document.querySelectorAll(
                'input[name="school-days"]:checked'
            )
        ).map(item => item.value);

        saveData();

    });

});


// Notification settings
document.getElementById("task-reminders")?.addEventListener(
    "change",
    event => {

        appData.settings.taskReminders = event.target.checked;

        saveData();

    }
);


document.getElementById("schedule-reminders")?.addEventListener(
    "change",
    event => {

        appData.settings.scheduleReminders = event.target.checked;

        saveData();

    }
);


// Export data
document.getElementById("export-data")?.addEventListener(
    "click",
    () => {

        const file = new Blob(
            [JSON.stringify(appData, null, 4)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(file);

        const link = document.createElement("a");

        link.href = url;

        link.download = "studyflow-backup.json";

        link.click();

        URL.revokeObjectURL(url);

    }
);



// ================= 11. RENDER ALL DATA =================

function renderAll() {

    renderDashboard();

    renderSchedule();

    renderTasks();

    updateTaskStatistics();

    renderGoals();

    renderNotes();

    renderTimerStatistics();

}



// ================= 12. INITIALIZE APP =================

function initializeApp() {

    initializeNavigation();

    loadSettings();

    setTimerMode("focus");

    renderAll();

    refreshIcons();

}


// Start StudyFlow
document.addEventListener("DOMContentLoaded", initializeApp);
