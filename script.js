
const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const initialDrivers = [
    { id: 1, name: "Max Verstappen", team: "Red Bull Racing", number: 1, color: "#3671c6", points: 25, wins: 1 },
    { id: 2, name: "Lando Norris", team: "McLaren", number: 4, color: "#ff8700", points: 18, wins: 0 },
    { id: 3, name: "Charles Leclerc", team: "Ferrari", number: 16, color: "#e8002d", points: 15, wins: 0 },
    { id: 4, name: "Oscar Piastri", team: "McLaren", number: 81, color: "#ff8700", points: 12, wins: 0 },
    { id: 5, name: "Carlos Sainz", team: "Williams", number: 55, color: "#64c4ff", points: 10, wins: 0 },
    { id: 6, name: "Lewis Hamilton", team: "Ferrari", number: 44, color: "#e8002d", points: 8, wins: 0 },
    { id: 7, name: "George Russell", team: "Mercedes", number: 63, color: "#27f4d2", points: 6, wins: 0 },
    { id: 8, name: "Fernando Alonso", team: "Aston Martin", number: 14, color: "#229971", points: 4, wins: 0 },
    { id: 9, name: "Pierre Gasly", team: "Alpine", number: 10, color: "#ff87bc", points: 2, wins: 0 },
    { id: 10, name: "Yuki Tsunoda", team: "RB", number: 22, color: "#6692ff", points: 1, wins: 0 }
];

const $ = selector => document.querySelector(selector);
const clone = data => JSON.parse(JSON.stringify(data));

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : clone(fallback);
    } catch (error) {
        return clone(fallback);
    }
}

let drivers = loadData("f1Drivers", initialDrivers);
let races = loadData("f1Races", []);

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function ordinal(number) {
    if (number % 100 >= 11 && number % 100 <= 13) return "th";
    if (number % 10 === 1) return "st";
    if (number % 10 === 2) return "nd";
    if (number % 10 === 3) return "rd";
    return "th";
}

function sortedDrivers() {
    return [...drivers].sort((a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        a.name.localeCompare(b.name)
    );
}

function saveData() {
    try {
        localStorage.setItem("f1Drivers", JSON.stringify(drivers));
        localStorage.setItem("f1Races", JSON.stringify(races));
        return true;
    } catch (error) {
        alert("Unable to save data in this browser. Check browser storage settings.");
        return false;
    }
}

function renderStandings(searchTerm = "") {
    const allDrivers = sortedDrivers();
    const filtered = allDrivers.filter(driver =>
        `${driver.name} ${driver.team}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    $("#standings").innerHTML = filtered.length
        ? filtered.map(driver => {
            const position = allDrivers.findIndex(item => item.id === driver.id) + 1;

            return `
                <tr>
                    <td>
                        <span class="pos ${position === 1 ? "first" : ""}">
                            ${String(position).padStart(2, "0")}
                        </span>
                    </td>
                    <td>
                        <span class="driver" style="--team:${escapeHTML(driver.color)}">
                            #${driver.number} &nbsp; ${escapeHTML(driver.name)}
                        </span>
                    </td>
                    <td>${escapeHTML(driver.team)}</td>
                    <td>${driver.wins}</td>
                    <td class="pointsnum">${driver.points}</td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="5">No drivers match your search.</td></tr>`;

    const leader = allDrivers[0];

    if (leader) {
        $("#leaderName").textContent = leader.name;
        $("#leaderTeam").textContent = leader.team;
        $("#leaderPoints").textContent = `${leader.points} PTS`;
    }
}

function renderRaceInputs() {
    $("#raceInputs").innerHTML = drivers.map(driver => `
        <div class="driverinput">
            <label for="position-${driver.id}">
                ${escapeHTML(driver.name)}
            </label>
            <select id="position-${driver.id}"
                    data-id="${driver.id}" required>
                <option value="">Choose position</option>
                ${drivers.map((item, index) => `
                    <option value="${index + 1}">
                        ${index + 1}${ordinal(index + 1)}
                    </option>
                `).join("")}
            </select>
        </div>
    `).join("");
}

function renderPoints() {
    $("#points").innerHTML = POINTS.map((points, index) => `
        <div class="point">
            <span>${index + 1}${ordinal(index + 1)}</span>
            <b>${points} pts</b>
        </div>
    `).join("");
}

function renderHistory() {
    $("#history").innerHTML = races.length
        ? [...races].reverse().map(race => `
            <tr>
                <td>${escapeHTML(race.name)}</td>
                <td>${escapeHTML(race.winner)}</td>
                <td>${race.winnerPoints} pts</td>
                <td>${escapeHTML(race.date)}</td>
            </tr>
        `).join("")
        : `<tr><td colspan="4">No races saved yet.</td></tr>`;
}

function renderAll() {
    renderStandings($("#search").value);
    renderRaceInputs();
    renderPoints();
    renderHistory();
}

function showView(viewName) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.add("hidden");
    });

    const target = $(`#${viewName}View`);

    if (target) target.classList.remove("hidden");

    document.querySelectorAll("nav button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );
    });
}

document.querySelectorAll("nav button").forEach(button => {
    button.addEventListener("click", () => {
        showView(button.dataset.view);
    });
});

$("#goRace").addEventListener("click", () => {
    showView("race");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

$("#search").addEventListener("input", event => {
    renderStandings(event.target.value);
});

$("#reset").addEventListener("click", () => {
    if (confirm("Reset all saved races and restore demo standings?")) {
        const oldDrivers = drivers;
        const oldRaces = races;

        drivers = clone(initialDrivers);
        races = [];

        if (saveData()) {
            renderAll();
            $("#message").textContent = "Demo data restored.";
            $("#message").classList.remove("error");
        } else {
            drivers = oldDrivers;
            races = oldRaces;
        }
    }
});

$("#raceForm").addEventListener("submit", event => {
    event.preventDefault();

    const message = $("#message");
    message.classList.remove("error");
    message.textContent = "";

    const showError = text => {
        message.textContent = text;
        message.classList.add("error");
    };

    const raceName = $("#raceName").value.trim();
    const selects = [...document.querySelectorAll("#raceInputs select")];
    const positions = selects.map(select => select.value);

    if (!raceName) {
        showError("Please enter a race name.");
        return;
    }

    if (positions.some(position => position === "")) {
        showError("Choose a finishing position for every driver.");
        return;
    }

    if (new Set(positions).size !== positions.length) {
        showError("Each driver must have a unique finishing position.");
        return;
    }

    const results = selects.map(select => {
        const driver = drivers.find(
            item => item.id === Number(select.dataset.id)
        );

        const position = Number(select.value);

        return {
            driverId: driver.id,
            name: driver.name,
            position,
            points: POINTS[position - 1] || 0
        };
    }).sort((a, b) => a.position - b.position);

    const updatedDrivers = clone(drivers);
    const updatedRaces = clone(races);

    results.forEach(result => {
        const driver = updatedDrivers.find(
            item => item.id === result.driverId
        );

        driver.points += result.points;

        if (result.position === 1) {
            driver.wins++;
        }
    });

    updatedRaces.push({
        name: raceName,
        winner: results[0].name,
        winnerPoints: results[0].points,
        date: new Date().toLocaleDateString()
    });

    const previousDrivers = drivers;
    const previousRaces = races;

    drivers = updatedDrivers;
    races = updatedRaces;

    if (!saveData()) {
        drivers = previousDrivers;
        races = previousRaces;
        return;
    }

    renderAll();

    message.textContent =
        `Saved "${raceName}". Standings updated successfully.`;

    $("#raceName").value = "";
    selects.forEach(select => {
        select.value = "";
    });
});

renderAll();
