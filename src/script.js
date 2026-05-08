const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("month");
const eventsList = document.getElementById("eventsList");
const yearSelect = document.getElementById("yearSelect");

let events = [];
let currentDate = new Date();
let selectedDate = new Date();

const months = [
  "Януари","Февруари","Март","Април","Май","Юни",
  "Юли","Август","Септември","Октомври","Ноември","Декември"
];

function sameDayMonth(d1, d2) {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth();
}

fetch("content.json")
  .then(res => res.json())
  .then(data => {
    events = data.events.map(e => ({
      ...e,
      date: new Date(e.date)
    }));

    populateYears();
    renderCalendar();
    showEvents();
  });

/* YEAR DROPDOWN */
function populateYears() {
  for (let y = 1500; y <= 2100; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  yearSelect.value = currentDate.getFullYear();
}

/* CALENDAR */
function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthLabel.textContent = `${months[month]} ${year}`;

  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.innerHTML += `<div></div>`;
  }

  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);

    const hasEvent = events.some(e =>
      sameDayMonth(e.date, date)
    );

    const div = document.createElement("div");
    div.className = "day";

    if (hasEvent) div.classList.add("event");

    if (date.toDateString() === selectedDate.toDateString()) {
      div.classList.add("active");
    }

    div.textContent = d;

    div.onclick = () => {
      selectedDate = date;
      renderCalendar();
      showEvents();
    };

    calendarGrid.appendChild(div);
  }
}

/* EVENTS */
function showEvents() {
  eventsList.innerHTML = "";

  const filtered = events.filter(e =>
    sameDayMonth(e.date, selectedDate)
  );

  if (!filtered.length) {
    eventsList.innerHTML = "<p>Няма събития</p>";
    return;
  }

  filtered.forEach(e => {
    eventsList.innerHTML += `
      <div class="card">
        <img src="${e.image}">
        <h3>${icon(e.category)} ${e.title}</h3>
        <p class="year">${e.date.getFullYear()}</p>
        <p>${e.description}</p>
      </div>
    `;
  });
}

function icon(type) {
  if (type === "church") return "⛪";
  if (type === "history") return "📜";
  return "🏙️";
}

/* NAVIGATION */
document.getElementById("prev").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById("next").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

/* YEAR CHANGE */
yearSelect.onchange = () => {
  currentDate.setFullYear(Number(yearSelect.value));
  renderCalendar();
};

document.getElementById("prevYear").onclick = () => {
  currentDate.setFullYear(currentDate.getFullYear() - 1);
  yearSelect.value = currentDate.getFullYear();
  renderCalendar();
};

document.getElementById("nextYear").onclick = () => {
  currentDate.setFullYear(currentDate.getFullYear() + 1);
  yearSelect.value = currentDate.getFullYear();
  renderCalendar();
};