import Camera from "./lib/camera.mjs";
import Storage from "./lib/storage.mjs";
import {
  cameraIcon,
  checkIcon,
  coffeeIcon,
  foodIcon,
  gasIcon,
  helpIcon,
  phoneIcon,
} from "./lib/images.mjs";
import { $, delegate, on, inline } from "./lib/dom.mjs";

const HIDE = "hide";
const MAP_BASE = 'https://www.google.com/maps/search';
const TWO_HOURS = 60 * 60 * 2;

const video = $("video");
const canvas = $("canvas");
const form = $("#upload-form");
const tprog = $('#top-progress');
const password = $('input[type="password"]', form);
const fileInput = $("#file-input");
const app = $("#app");
let curShift = Storage.get("shift");

const footerMenu = document.createElement("footer-nav");
footerMenu.id = "nav";

document.body.appendChild(footerMenu);

// TODO: make webcomponent
function renderRow(row) {
  const name = row["First Name"];
  const instructions = row["Delivery Instructions"] ?? "";
  const {
    City: city,
    Language: language,
    Phone: phone,
    Street: address,
    Zip: zip,
  } = row;

  const searchParams = new URLSearchParams({
    api: 1,
    query: `${address} ${city}, ${zip}`,
  });

  return /* html */ `
    <div id="current">
      <h1>${index + 1} <sup> / ${curShift.length}</sup></h1>
      <h2>${name}</h2>
      <a class="address" href="${MAP_BASE}/?${searchParams}">${address}</a>
      <div id="phone-lang">
        <a class="phone" href="tel:+1${phone}">${phoneIcon}${phone}</a>
        <span class="language">${language || "English"}</span>
      </div>
      <p id="instructions">${instructions.replace(/["]{2,}/g, '"')}</p>
      <div id="quickhelp">
        ${gasIcon}
        ${coffeeIcon}
        ${foodIcon}
        ${helpIcon}
      </div>
      <!-- <div id="capture-container"></div> -->
    </div>
  `;
}

{/* 
<div aria-role="button" id="camera-launch">
  ${cameraIcon}
  ${checkIcon}
</div>
<button id="camera-snap">Snap</button>
*/}

const socket = io();
let index = 0;
let cam;

function launchCamera(event) {
  if (event.target.id !== "camera-icon") return;

  $("#camera").classList.remove("hide");
  Camera.tryInvokePermission(video, canvas)
    .then((camera) => {
      cam = camera;
      cam.start();
    })
    .catch((error) => {
      // Mostly happens if the user blocks the camera or the media devices are not supported
    });
}

const open = (url) => () => window.open(url);

// delegate("click", "#app", "#camera-icon", launchCamera);
// delegate("click", "#app", "#camera-snap", () => cam && cam.snap());

delegate('click', '#current', '#gas', open(`${MAP_BASE}/closest+gas+station`));
delegate('click', '#current', '#food-icon', open(`${MAP_BASE}/nearby+restaurants`));
delegate('click', '#current', '#coffee', open(`${MAP_BASE}/nearby+coffee`));

const join = $("#join");

function main(data) {
  form.classList.add(HIDE);
  app.classList.remove(HIDE);
  join.classList.remove(HIDE);

  const prog = document.createElement('task-progression');
  const updateProgress = (count, current) => {
    [tprog, prog].forEach((el) => {
      el.setAttribute('count', count);
      el.setAttribute('current', current);
    });
  }

  on(join, 'click', async () => {
    const response = await fetch("/qr").then((res) => res.json());
    $("#qrcode").src = response.qr;
    $(".modal").classList.remove("hide");
  });

  on(footerMenu, 'next-page', () => {
    if (index < data.length - 1) {
      index += 1;
    } else {
      index = 0;
    }
    app.innerHTML = renderRow(data[index]);
    updateProgress(data.length, index);
    socket.emit("page", index);
  });

  on(footerMenu, 'prev-page', () => {
    if (index > 0) {
      index -= 1;
    } else {
      index = data.length - 1;
    }
    app.innerHTML = renderRow(data[index]);
    updateProgress(data.length, index);
    socket.emit("page", index);
  });

  app.innerHTML = renderRow(data[index]);
  updateProgress(data.length, index);
  document.body.insertBefore(prog, footerMenu);
}

if (curShift) {
  main(curShift);
}

if (Storage.get("password")) {
  password.value = Storage.get("password");
}

on(form, "submit", function (event) {
  event.preventDefault();
  form.querySelector("aside.hide").classList.remove(HIDE);
  // Check if the file is a PDF
  const file = fileInput.files[0];
  if (file.type !== "application/pdf") {
    alert("Please select a PDF file.");
    return;
  }

  if (password) {
    Storage.set("password", password.value, TWO_HOURS);
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append("password", password.value);
  formData.append("file", file);

  // Send the request
  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      curShift = data;
      Storage.set("shift", data, TWO_HOURS);
      main(data);
    })
    .catch((error) => {
      console.error("Unable to upload file:", error);
    });
});
