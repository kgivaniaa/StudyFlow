
/* =====================================================
   STUDYFLOW
   JavaScript - Student Productivity Hub
   ===================================================== */

/* ================= 1. INITIAL SETTINGS ================= */

const STORAGE_KEY = "studyflow_data";

const defaultData = {
    profile: { name: "Student", email: "" },
    schedules: [],
    tasks: [],
    goals: [],
    notes: [],
    sessions: [],
    settings: {
        theme: "lavender",
        schoolDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        taskReminders: true,
        scheduleReminders: true
    },
    timer: { focus: 25, short: 5, long: 15 }
};

function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return structuredClone(defaultData);

        const parsedData = JSON.parse(savedData);

        return {
            ...structuredClone(defaultData),
            ...parsedData,
            profile: { ...defaultData.profile, ...parsedData.profile },
            settings: { ...defaultData.settings, ...parsedData.settings },
            timer: { ...defaultData.timer, ...parsedData.timer },
            schedules: Array.isArray(parsedData.schedules) ? parsedData.schedules : [],
            tasks: Array.isArray(parsedData.tasks)
                ? parsedData.tasks.map(task => ({
                    ...task,
                    status: normalizeTaskStatus(task.status),
                    priority: task.priority || "Medium",
                    name: String(task.name || ""),
                    subject: String(task.subject || ""),
                    description: String(task.description || "")
                }))
                : [],
            goals: Array.isArray(parsedData.goals) ? parsedData.goals : [],
            notes: Array.isArray(parsedData.notes) ? parsedData.notes : [],
            sessions: Array.isArray(parsedData.sessions) ? parsedData.sessions : []
        };
    } catch (error) {
        console.error("Unable to load StudyFlow data:", error);
        return structuredClone(defaultData);
    }
}

let appData = loadData();

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
        console.error("Unable to save StudyFlow data:", error);
        alert("Data could not be saved. Check your browser storage.");
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

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

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function normalizeTaskStatus(status) {
    const value = String(status || "todo").toLowerCase().replace(/[_-]/g, " ").trim();

    if (["completed", "complete", "done"].includes(value)) return "Completed";
    if (["in progress", "progress", "ongoing"].includes(value)) return "In Progress";
    return "To Do";
}

function taskStatusInputValue(status) {
    const normalized = normalizeTaskStatus(status);
    if (normalized === "Completed") return "completed";
    if (normalized === "In Progress") return "progress";
    return "todo";
}

function refreshIcons() {
    if (window.lucide) lucide.createIcons();
}

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

function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getTodayName() {
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
}

function formatTime(time) {
    return time || "";
}

/* ================= 2. NAVIGATION ================= */

const sidebar = document.getElementById("sidebar");
const navLinks = document.querySelectorAll(".nav-link");
const pageSections = document.querySelectorAll(".page-section");
const breadcrumbTitle = document.getElementById("page-title");

function showPage(pageName) {
    const targetPage = document.getElementById(pageName);
    if (!targetPage) return;

    pageSections.forEach(section => section.classList.remove("active"));
    targetPage.classList.add("active");

    navLinks.forEach(link => {
        link.classList.toggle("active", link.dataset.page === pageName);
    });

    const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);

    if (breadcrumbTitle && activeLink) {
        breadcrumbTitle.textContent = activeLink.querySelector("span").textContent;
    }

    sidebar?.classList.remove("open");

    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", `#${pageName}`);
    refreshIcons();
}

navLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showPage(link.dataset.page);
    });
});

document.querySelectorAll("[data-navigate]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.navigate));
});

const mobileMenuButton = document.getElementById("mobile-menu-button");

mobileMenuButton?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
});

document.addEventListener("click", event => {
    if (!sidebar || !sidebar.classList.contains("open")) return;

    if (!sidebar.contains(event.target) && !mobileMenuButton?.contains(event.target)) {
        sidebar.classList.remove("open");
    }
});

function initializeNavigation() {
    const requestedPage = location.hash.replace("#", "");
    const validPages = [
        "dashboard", "schedule", "tasks", "progress",
        "notes", "timer", "settings"
    ];

    if (validPages.includes(requestedPage)) showPage(requestedPage);
}

/* ================= 3. MODAL SYSTEM ================= */

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

document.querySelectorAll(".close-modal").forEach(button => {
    button.addEventListener("click", () => {
        const modal = button.closest(".modal");
        if (modal) closeModal(modal.id);
    });
});

document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
});

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal(modal.id);
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal.active").forEach(modal => closeModal(modal.id));
    }
});

/* ================= 4. DASHBOARD ================= */

function renderDashboard() {
    updateWelcomeMessage();
    updateDashboardStatistics();
    renderDashboardSchedules();
    renderDashboardTasks();
    updateDailyProgress();
    renderWeeklyOverview();
}

function updateWelcomeMessage() {
    const name = appData.profile.name || "Student";
    const welcomeName = document.getElementById("welcome-name");
    const sidebarUsername = document.getElementById("sidebar-username");
    const topbarUsername = document.getElementById("topbar-username");
    const currentDate = document.getElementById("current-date");

    if (welcomeName) welcomeName.textContent = name;
    if (sidebarUsername) sidebarUsername.textContent = name;
    if (topbarUsername) topbarUsername.textContent = name;

    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }
}

function updateDashboardStatistics() {
    const totalSchedules = appData.schedules.length;
    const totalTasks = appData.tasks.length;

    const completedTasks = appData.tasks.filter(
        task => normalizeTaskStatus(task.status) === "Completed"
    ).length;

    const totalMinutes = appData.sessions.reduce(
        (sum, session) => sum + Number(session.minutes || 0), 0
    );

    const studyHours = (totalMinutes / 60).toFixed(1);

    setText("total-schedules", totalSchedules);
    setText("total-tasks", totalTasks);
    setText("completed-tasks", completedTasks);
    setText("study-hours", `${studyHours}h`);
}

function renderDashboardSchedules() {
    const container = document.getElementById("dashboard-schedule");
    if (!container) return;

    const today = getTodayName();

    const schedules = appData.schedules
        .filter(schedule => schedule.day === today)
        .sort((a, b) => (a.start || "").localeCompare(b.start || ""));

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

function renderDashboardTasks() {
    const container = document.getElementById("dashboard-tasks");
    if (!container) return;

    const tasks = [...appData.tasks]
        .filter(task => normalizeTaskStatus(task.status) !== "Completed")
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
            <span class="task-priority priority-${String(task.priority || "medium").toLowerCase()}">
                ${escapeHTML(task.priority || "Medium")}
            </span>
        </div>
    `).join("");

    refreshIcons();
}

function updateDailyProgress() {
    const today = getTodayString();

    const todayTasks = appData.tasks.filter(task => task.deadline === today);
    let percentage = 0;

    if (todayTasks.length > 0) {
        const completed = todayTasks.filter(
            task => normalizeTaskStatus(task.status) === "Completed"
        ).length;

        percentage = Math.round(completed / todayTasks.length * 100);
    }

    const progressText = document.getElementById("daily-progress");
    const progressCircle = document.getElementById("daily-progress-circle");

    if (progressText) progressText.textContent = `${percentage}%`;

    if (progressCircle) {
        progressCircle.style.background = `
            conic-gradient(
                var(--primary) ${percentage * 3.6}deg,
                #EEEAF4 ${percentage * 3.6}deg
            )
        `;
    }
}

function renderWeeklyOverview() {
    const container = document.getElementById("weekly-overview");
    if (!container) return;

    const days = [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
    ];

    container.innerHTML = days.map(day => {
        const count = appData.schedules.filter(
            schedule => schedule.day === day
        ).length;

        return `
            <div class="weekly-day">
                <span>${day.substring(0, 3)}</span>
                <div class="weekly-bar">
                    <div class="weekly-bar-fill" style="width:${Math.min(count * 20, 100)}%"></div>
                </div>
                <strong>${count}</strong>
            </div>
        `;
    }).join("");
}
