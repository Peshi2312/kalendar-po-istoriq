const monthNames = [
    "Януари", "Февруари", "Март", "Април", "Май", "Юни",
    "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const calendarGrid = document.getElementById("calendarGrid");
const monthName = document.getElementById("monthName");
const yearNumber = document.getElementById("yearNumber");
const eventList = document.getElementById("eventList");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

let events = [];
let selectedDate = new Date();

function loadEvents() {
    return fetch("./content.json")
        .then(response => response.json())
        .then(data => {
            events = data.events.map(event => ({
                ...event,
                date: new Date(event.date)
            }));
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
    yearNumber.textContent = year;

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
            buildCalendar(selectedDate);
            renderEventsForSelectedDate();
        });

        calendarGrid.appendChild(dayCell);
    }
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

prevMonthButton.addEventListener("click", () => {
    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    buildCalendar(selectedDate);
    renderEventsForSelectedDate();
});

nextMonthButton.addEventListener("click", () => {
    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
    buildCalendar(selectedDate);
    renderEventsForSelectedDate();
});

loadEvents()
    .then(() => {
        buildCalendar(selectedDate);
        renderEventsForSelectedDate();
    })
    .catch(error => {
        console.error("Неуспешно зареждане на събитията:", error);
        eventList.innerHTML = "<p>Не може да се заредят събитията в момента.</p>";
    });
