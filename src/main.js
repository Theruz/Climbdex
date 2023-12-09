const colors = ["#4cf0fd", "#00ff00", "#fbe400", "#ff00ff"];
const colorsToString = {
  "#4cf0fd": "13",
  "#00ff00": "12",
  "#fbe400": "15",
  "#ff00ff": "14",
};
const stringToColors = {
  13: "#4cf0fd",
  12: "#00ff00",
  15: "#fbe400",
  14: "#ff00ff",
};
const filteredHoldsToColors = {};
const climbHolds = [];

function getCircle(id, x, y, radius) {
  let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("id", id);
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill-opacity", 0.0);
  circle.setAttribute("stroke-opacity", 0.0);
  circle.setAttribute("stroke-width", 6);
  return circle;
}

function drawFilterCircle(id, x, y, radius) {
  let circle = getCircle(id, x, y, radius);
  circle.onclick = function (event) {
    const currentColor = event.target.getAttribute("stroke");
    let currentIndex = colors.indexOf(currentColor);
    let nextIndex = currentIndex + 1;
    let holdId = event.target.id.split("-")[1];
    if (nextIndex >= colors.length) {
      event.target.setAttribute("stroke-opacity", 0.0);
      event.target.setAttribute("stroke", "black");
      delete filteredHoldsToColors[holdId];
    } else {
      event.target.setAttribute("stroke", colors[nextIndex]);
      event.target.setAttribute("stroke-opacity", 1.0);
      filteredHoldsToColors[holdId] = colors[nextIndex];
    }
  };
  document.getElementById("filter-svg").appendChild(circle);
}

function drawClimbCircle(id, x, y, radius) {
  let circle = getCircle(id, x, y, radius);
  document.getElementById("climb-svg").appendChild(circle);
}

function drawHoldCircles() {
  let xOffset = 184;
  let xSpacing = 1477 / 192;
  let yOffset = 1200;
  let ySpacing = 1200 / 156;
  for (const [hold_id, coords] of Object.entries(holds)) {
    let x = coords.x * xSpacing + xOffset;
    let y = yOffset - coords.y * ySpacing;
    drawFilterCircle(`filter-${hold_id}`, x, y, 30);
    drawClimbCircle(`climb-${hold_id}`, x, y, 30);
  }
}

function drawClimb(climb_string) {
  const hold_strings = climb_string.split("p");
  for (const hold_string of hold_strings) {
    if (hold_string.length > 0) {
      const [hold_id, color_string] = hold_string.split("r");
      const color = stringToColors[color_string];
      const circle = document.getElementById(`climb-${hold_id}`);
      circle.setAttribute("stroke", color);
      circle.setAttribute("stroke-opacity", 1.0);
      climbHolds.push(hold_id);
    }
  }
}

function eraseClimb() {
  for (const hold_id of climbHolds) {
    const circle = document.getElementById(`climb-${hold_id}`);
    circle.setAttribute("stroke-opacity", 0.0);
  }
  climbHolds.length = 0;
}

document.getElementById("search-button").addEventListener("click", function () {
  const maxMatches = 40;
  const matchList = document.getElementById("match-list");
  matchList.innerHTML = "";
  let subStrings = [];
  for (const [holdId, color] of Object.entries(filteredHoldsToColors)) {
    subStrings.push("p" + holdId + "r" + colorsToString[color]);
  }
  subStrings.sort();
  let regexp = new RegExp(subStrings.join(".*"));
  let matchCount = 0;
  for (const [climb_uuid, name, climb_string] of climbs) {
    if (climb_string.match(regexp)) {
      let li = document.createElement("li");
      li.setAttribute("data-climb-string", climb_string);
      li.addEventListener("click", function (event) {
        const climb_string = event.target.getAttribute("data-climb-string");
        eraseClimb();
        drawClimb(climb_string);
      });
      li.appendChild(document.createTextNode(name));
      matchList.appendChild(li);
      matchCount++;
      if (matchCount >= maxMatches) {
        break;
      }
    }
  }
});

drawHoldCircles();
