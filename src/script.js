const daysContainer = document.getElementById("days");
const monthLabel = document.getElementById("month");
const infoBox = document.getElementById("infoBox");

const search = document.getElementById("search");
const yearButtons = document.getElementById("yearButtons");
const monthButtons = document.getElementById("monthButtons");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

let currentDate = new Date(1872,1,1);
let events = [];
let filteredEvents = [];
let activeYears = [];

const months = [
"Януари","Февруари","Март","Април","Май","Юни",
"Юли","Август","Септември","Октомври","Ноември","Декември"
];

/* LOAD JSON */
fetch("./content.json")
.then(r=>r.json())
.then(data=>{

    events = data.events.map(e=>({
        ...e,
        category:e.category === "educationCulture" ? "education" : e.category,
        date:new Date(e.date)
    }));

    filteredEvents = events;

    activeYears = [...new Set(events.map(e=>e.date.getFullYear()))].sort((a,b)=>a-b);

    if(!activeYears.includes(currentDate.getFullYear())){
        currentDate = new Date(activeYears[0], currentDate.getMonth(), 1);
    }

    renderFilters();
    renderCalendar();
});

/* FILTERS */

function renderFilters(){

    if(yearButtons){
        yearButtons.innerHTML = activeYears.map(year=>`
            <button class="chip ${year===currentDate.getFullYear() ? "active" : ""}" data-year="${year}">${year}</button>
        `).join("");

        yearButtons.querySelectorAll("button[data-year]").forEach(button=>{
            button.onclick = () => {
                currentDate = new Date(Number(button.dataset.year), currentDate.getMonth(), 1);
                renderFilters();
                renderCalendar();
            };
        });
    }

    if(monthButtons){
        monthButtons.innerHTML = months.map((monthName, index)=>`
            <button class="chip ${index===currentDate.getMonth() ? "active" : ""}" data-month="${index}">${monthName}</button>
        `).join("");

        monthButtons.querySelectorAll("button[data-month]").forEach(button=>{
            button.onclick = () => {
                currentDate = new Date(currentDate.getFullYear(), Number(button.dataset.month), 1);
                renderFilters();
                renderCalendar();
            };
        });
    }
}

function applyFilters(){

    let result = [...events];

    const q = search.value.toLowerCase().trim();

    if(q){
        result = result.filter(e=>
            e.title.toLowerCase().includes(q) ||
            e.person.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
        );
    }

    filteredEvents = result;
    renderCalendar();
}

search.oninput = applyFilters;

/* CALENDAR */

function renderCalendar(){

    daysContainer.innerHTML="";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthLabel.textContent = `${months[month]} ${year}`;

    const firstDay = (new Date(year,month,1).getDay()+6)%7;
    const days = new Date(year,month+1,0).getDate();

    for(let i=0;i<firstDay;i++){
        daysContainer.innerHTML += `<div></div>`;
    }

    for(let d=1;d<=days;d++){

        const div = document.createElement("div");
        div.className="day";

        const event = filteredEvents.find(e=>
            e.date.getFullYear()==year &&
            e.date.getMonth()==month &&
            e.date.getDate()==d
        );

        if(event){
            div.classList.add(event.category);
            div.innerHTML = `<b>${d}</b><div class="event-title">${event.title}</div>`;

            div.onclick=()=>{
                infoBox.innerHTML=`
                    <h2>${event.title}</h2>
                    <p>${event.description}</p>
                    <hr>
                    <p><b>${event.person}</b></p>
                    ${event.wiki ? `<a href="${event.wiki}" target="_blank" rel="noopener noreferrer">Виж в Wikipedia</a>` : ""}
                `;
            };
        } else {
            div.innerHTML=`<b>${d}</b>`;
        }

        daysContainer.appendChild(div);
    }
}

/* NAV */

prevButton.onclick=()=>{
    currentDate.setMonth(currentDate.getMonth()-1);
    renderFilters();
    renderCalendar();
};

nextButton.onclick=()=>{
    currentDate.setMonth(currentDate.getMonth()+1);
    renderFilters();
    renderCalendar();
};