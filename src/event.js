fetch("./content.json")
    .then(response => response.json())
    .then(data => {
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get("id"));
        const event = data.events[id];

        if (!event) {
            document.title = "Събитието не е намерено";
            document.querySelector(".event-card").innerHTML = `
                <div class="event-content event-content--empty">
                    <div class="event-category">Грешка</div>
                    <h1>Събитието не е намерено</h1>
                    <p>Върни се към календара и избери друго събитие.</p>
                    <a class="hero-btn" href="calendar.html">← Назад към календара</a>
                </div>
            `;
            return;
        }

        document.title = event.title;
        document.getElementById("eventTitle").textContent = event.title;
        document.getElementById("eventDescription").textContent = event.fullDescription || event.description;
        document.getElementById("eventPerson").textContent = event.person;
        document.getElementById("eventCategory").textContent = event.category;

        const date = new Date(event.date);
        document.getElementById("eventDate").textContent = date.toLocaleDateString("bg-BG", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        /*
         * Image handling
         * - If an `image` property exists on the event object, show it.
         * - If no `image` is provided, remove the <img> element so the layout
         *   does not show an empty placeholder.
         *
         * How to add person images:
         * 1) Put image files under the `photos/` folder in the project (e.g.:
         *    `photos/ivan-vazov.jpg`)
         * 2) In the corresponding event object in `content.json` add the field:
         *    "image": "photos/ivan-vazov.jpg"
         *    (use a relative path from the `src/` folder where pages are served)
         * 3) The image will then appear on the event detail page. For events
         *    without images nothing will be shown.
         */

        const image = document.getElementById("eventImage");
        if (event.image) {
            image.src = event.image;
            image.alt = event.person || event.title;
        } else {
            // remove the image node to avoid empty space in the layout
            image.remove();
        }
    });