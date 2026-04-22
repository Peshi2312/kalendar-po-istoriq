const monthNames = [
    "Януари", "Февруари", "Март", "Април", "Май", "Юни",
    "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const calendarGrid = document.getElementById("calendarGrid");
const monthName = document.getElementById("monthName");
const yearSelect = document.getElementById("yearSelect");
const eventList = document.getElementById("eventList");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");
const prevYearButton = document.getElementById("prevYear");
const nextYearButton = document.getElementById("nextYear");

let events = [];
let eventYears = [];
let firstEventDateByYear = new Map();
let selectedDate = new Date();
let viewDate = new Date();

function getUniqueEventYears() {
    return [...new Set(events.map(event => event.date.getFullYear()))].sort((left, right) => left - right);
}

function syncYearSelect() {
    yearSelect.value = String(viewDate.getFullYear());
}

function showDate(date, keepExactSelection = false) {
    viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
    selectedDate = keepExactSelection ? new Date(date) : new Date(viewDate);
    buildCalendar(viewDate);
    renderEventsForSelectedDate();
    syncYearSelect();
}

function loadEvents() {
    return fetch("./content.json")
        .then(response => response.json())
        .then(data => {
            events = data.events.map(event => ({
                ...event,
                date: new Date(event.date)
            })).sort((left, right) => left.date - right.date);

            eventYears = getUniqueEventYears();
            firstEventDateByYear = new Map();

            events.forEach(event => {
                const year = event.date.getFullYear();
                if (!firstEventDateByYear.has(year)) {
                    firstEventDateByYear.set(year, new Date(event.date));
                }
            });
        });
}

function getEventsForDate(date) {
    const target = date.toDateString();
    return events.filter(event => event.date.toDateString() === target);
}

function buildCalendar(date) {
    calendarGrid.innerHTML = "";
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startWeekDay = (firstDayOfMonth.getDay() + 6) % 7;

    monthName.textContent = monthNames[month];

    const calendarStartDate = new Date(year, month, 1 - startWeekDay);
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
        const cellDate = new Date(calendarStartDate);
        cellDate.setDate(calendarStartDate.getDate() + i);

        const dayCell = document.createElement("button");
        dayCell.className = "day-cell";
        if (cellDate.getMonth() !== month) {
            dayCell.classList.add("outside");
            dayCell.disabled = true;
        }

        const dayNumber = document.createElement("span");
        dayNumber.className = "day-number";
        dayNumber.textContent = cellDate.getDate();
        dayCell.appendChild(dayNumber);

        const dateEvents = getEventsForDate(cellDate);
        if (dateEvents.length > 0) {
            const marker = document.createElement("div");
            marker.className = "event-marker";
            dateEvents.slice(0, 2).forEach(() => {
                const dot = document.createElement("span");
                dot.className = "event-dot";
                marker.appendChild(dot);
            });
            dayCell.appendChild(marker);
        }

        if (cellDate.toDateString() === selectedDate.toDateString()) {
            dayCell.classList.add("active");
        }

        dayCell.addEventListener("click", () => {
            selectedDate = cellDate;
            showDate(cellDate, true);
        });

        calendarGrid.appendChild(dayCell);
    }
}

function populateYearSelect() {
    yearSelect.innerHTML = "";

    eventYears.forEach(year => {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = String(year);
        yearSelect.appendChild(option);
    });
}

function renderEventsForSelectedDate() {
    eventList.innerHTML = "";
    const dateEvents = getEventsForDate(selectedDate);

    const header = document.createElement("div");
    header.className = "overview-card";
    header.innerHTML = `<h3>${selectedDate.toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" })}</h3>`;
    eventList.appendChild(header);

    if (dateEvents.length === 0) {
        const emptyNotice = document.createElement("p");
        emptyNotice.textContent = "Няма записани събития за тази дата.";
        emptyNotice.style.color = "#475569";
        eventList.appendChild(emptyNotice);
        return;
    }

    dateEvents.forEach(event => {
        const card = document.createElement("article");
        card.className = "event-card";
        card.innerHTML = `
            <h3>${event.title}</h3>
            <p><strong>Година:</strong> ${event.date.getFullYear()}</p>
            <p>${event.description}</p>
        `;
        eventList.appendChild(card);
    });
}

function changeMonth(offset) {
    showDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
}

function changeYear(offset) {
    if (eventYears.length === 0) {
        return;
    }

    const currentYear = viewDate.getFullYear();
    const currentIndex = eventYears.indexOf(currentYear);
    const fallbackIndex = eventYears.findIndex(year => year > currentYear);
    const startingIndex = currentIndex >= 0 ? currentIndex : Math.max(0, fallbackIndex === -1 ? eventYears.length - 1 : fallbackIndex);
    const nextIndex = Math.min(Math.max(startingIndex + offset, 0), eventYears.length - 1);
    const nextYear = eventYears[nextIndex];
    const targetDate = firstEventDateByYear.get(nextYear) ?? new Date(nextYear, 0, 1);

    showDate(targetDate, true);
}

prevMonthButton.addEventListener("click", () => {
    changeMonth(-1);
});

nextMonthButton.addEventListener("click", () => {
    changeMonth(1);
});

prevYearButton.addEventListener("click", () => {
    changeYear(-1);
});

nextYearButton.addEventListener("click", () => {
    changeYear(1);
});

yearSelect.addEventListener("change", event => {
    const year = Number(event.target.value);
    const targetDate = firstEventDateByYear.get(year) ?? new Date(year, 0, 1);
    showDate(targetDate, true);
});

loadEvents()
    .then(() => {
        const initialDate = events[0]?.date ?? new Date();
        populateYearSelect();
        showDate(initialDate, true);
    })
    .catch(error => {
        console.error("Неуспешно зареждане на събитията:", error);
        eventList.innerHTML = "<p>Не може да се заредят събитията в момента.</p>";
    });
