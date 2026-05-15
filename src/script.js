// =========================
// SCRIPT.JS
// =========================

const daysContainer = document.getElementById("days");

const monthLabel = document.getElementById("month");

const infoBox = document.getElementById("infoBox");

const search = document.getElementById("search");

const yearButtons = document.getElementById("yearButtons");

const monthButtons = document.getElementById("monthButtons");

const prevBtn = document.getElementById("prev");

const nextBtn = document.getElementById("next");

const months = [
"Януари",
"Февруари",
"Март",
"Април",
"Май",
"Юни",
"Юли",
"Август",
"Септември",
"Октомври",
"Ноември",
"Декември"
];

let currentDate = new Date(1872,1);

let events = [];

let filteredEvents = [];

fetch("./content.json")

.then(res => res.json())

.then(data => {

    events = data.events.map(event => ({
        ...event,
        date:new Date(event.date)
    }));

    filteredEvents = events;

    renderYearButtons();

    renderMonthButtons();

    renderCalendar();
});

/* YEAR BUTTONS */

function renderYearButtons(){

    const years = [
        ...new Set(
            events.map(e => e.date.getFullYear())
        )
    ];

    yearButtons.innerHTML = "";

    years.forEach(year => {

        const btn = document.createElement("button");

        btn.className = "chip";

        if(year === currentDate.getFullYear()){

            btn.classList.add("active");
        }

        btn.textContent = year;

        btn.onclick = () => {

            currentDate = new Date(
                year,
                currentDate.getMonth(),
                1
            );

            renderYearButtons();

            renderCalendar();
        };

        yearButtons.appendChild(btn);
    });
}

/* MONTH BUTTONS */

function renderMonthButtons(){

    monthButtons.innerHTML = "";

    months.forEach((month,index) => {

        const btn = document.createElement("button");

        btn.className = "chip";

        if(index === currentDate.getMonth()){

            btn.classList.add("active");
        }

        btn.textContent = month;

        btn.onclick = () => {

            currentDate = new Date(
                currentDate.getFullYear(),
                index,
                1
            );

            renderMonthButtons();

            renderCalendar();
        };

        monthButtons.appendChild(btn);
    });
}

/* SEARCH */

search.addEventListener("input", () => {

    const value = search.value.toLowerCase();

    filteredEvents = events.filter(event => {

        return (

            event.title.toLowerCase().includes(value)

            ||

            event.person.toLowerCase().includes(value)

            ||

            event.description.toLowerCase().includes(value)
        );
    });

    renderCalendar();
});

/* CALENDAR */

function renderCalendar(){

    daysContainer.innerHTML = "";

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    monthLabel.textContent =
        `${months[month]} ${year}`;

    const firstDay =
        (new Date(year,month,1).getDay()+6)%7;

    const totalDays =
        new Date(year,month+1,0).getDate();

    for(let i=0;i<firstDay;i++){

        const empty = document.createElement("div");

        empty.className = "day";

        empty.setAttribute("aria-disabled","true");

        daysContainer.appendChild(empty);
    }

    for(let day=1;day<=totalDays;day++){

        const div = document.createElement("div");

        div.className = "day";

        const number = document.createElement("b");

        number.textContent = day;

        div.appendChild(number);

        const key =
        `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

        const event =
            filteredEvents.find(
                e => formatDate(e.date) === key
            );

        if(event){

            div.classList.add(event.category);

            const title = document.createElement("div");

            title.className = "event-title";

            title.textContent = event.title;

            div.appendChild(title);

            div.onclick = () => {

                infoBox.innerHTML = `

                    <h2>${event.title}</h2>

                    <p>${event.description}</p>

                    <hr>

                    <p>
                        <b>${event.person}</b>
                    </p>

                    <a href="${event.wiki}" target="_blank">
                        Wikipedia
                    </a>

                `;
            };
        }

        daysContainer.appendChild(div);
    }
}

function formatDate(date){

    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

/* NAVIGATION */

prevBtn.onclick = () => {

    currentDate.setMonth(
        currentDate.getMonth()-1
    );

    renderMonthButtons();

    renderYearButtons();

    renderCalendar();
};

nextBtn.onclick = () => {

    currentDate.setMonth(
        currentDate.getMonth()+1
    );

    renderMonthButtons();

    renderYearButtons();

    renderCalendar();
};