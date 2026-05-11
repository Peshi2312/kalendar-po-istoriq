const container = document.getElementById("calendarOnlyEvents");

const months = [
  "Януари","Февруари","Март","Април","Май","Юни",
  "Юли","Август","Септември","Октомври","Ноември","Декември"
];

fetch("content.json")
.then(res => res.json())
.then(data => {

    const events = data.events.map(e => ({
        ...e,
        date: new Date(e.date)
    }));

    render(events);

});

function render(events){

    container.innerHTML = "";

    const grouped = {};

    events.forEach(e => {

        const key = `${e.date.getFullYear()}-${e.date.getMonth()}`;

        if(!grouped[key]) grouped[key] = [];

        grouped[key].push(e);
    });

    Object.keys(grouped)
    .sort((a,b)=> new Date(a) - new Date(b))
    .forEach(key => {

        const [year, month] = key.split("-");

        const block = document.createElement("div");

        block.className = "month-block";

        block.innerHTML = `
            <div class="month-title">
                ${months[month]} ${year}
            </div>
        `;

        grouped[key].forEach(e => {

            block.innerHTML += `
                <div class="event-item ${e.category}">

                    <div class="event-date">
                        ${e.date.getDate()} ${months[e.date.getMonth()]} ${e.date.getFullYear()}
                    </div>

                    <div><b>${e.title}</b></div>

                    <div>${e.shortDescription}</div>

                    <details>
                        <summary>Повече информация</summary>

                        <p>${e.fullDescription}</p>

                        <p><b>Личност:</b> ${e.person.name}</p>

                        <p>${e.person.description}</p>

                        <a href="${e.person.wiki}" target="_blank">
                            Wikipedia
                        </a>
                    </details>

                </div>
            `;
        });

        container.appendChild(block);
    });
}