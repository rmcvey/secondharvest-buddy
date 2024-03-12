import Camera from "./lib/Camera.mjs";
import Storage from "./lib/storage.mjs";
import {
  cameraIcon,
  checkIcon,
  coffeeIcon,
  foodIcon,
  gasIcon,
  phoneIcon,
} from "./lib/images.mjs";
import { $, delegate, on } from "./lib/dom.mjs";

const HIDE = "hide";

const video = $("video");
const canvas = $("canvas");
const form = $("#upload-form");
const password = $('input[type="password"]', form);
const fileInput = $("#file-input");
const app = $("#app");
let curShift = Storage.get("shift");

const elem = document.createElement("footer-nav");
elem.id = "nav";

document.body.appendChild(elem);

// TODO: make webcomponent
function populate(row) {
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
      <a class="address" href="https://www.google.com/maps/search/?${searchParams}">${address} ${city}, ${zip}</a>
      <div id="phone-lang">
        <a class="phone" href="tel:+1${phone}">${phoneIcon} ${phone}</a>
        <span class="language">${language || "English"}</span>
      </div>
      <p>${instructions.replace(/["]{2,}/g, '"')}</p>
      <div id="quickhelp">
        ${gasIcon}
        ${coffeeIcon}
        ${foodIcon}
      </div>
      <div id="capture-container">
        <div aria-role="button" id="camera-launch">
          ${cameraIcon}
          ${checkIcon}
        </div>
        <button id="camera-snap">Snap</button>
      </div>
    </div>
  `;
}

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

function open(url) {
  return () => window.open(url);
}

delegate("click", "#app", "#camera-icon", launchCamera);
delegate("click", "#app", "#camera-snap", () => cam && cam.snap());
delegate('click', '#app', '#gas', open('https://www.google.com/maps/search/closest+gas+station'));
delegate('click', '#app', '#food-icon', open('https://www.google.com/maps/search/nearby+restaurants'));
delegate('click', '#app', '#coffee', open('https://www.google.com/maps/search/nearby+coffee'));

const join = $("#join");

function main(data) {
  form.classList.add(HIDE);
  app.classList.remove(HIDE);
  join.classList.remove(HIDE);

  on(join, 'click', async () => {
    const response = await fetch("/qr").then((res) => res.json());
    $("#qrcode").src = response.qr;
    $(".modal").classList.remove("hide");
  });

  on(elem, 'next-page', () => {
    if (index < data.length - 1) {
      index += 1;
    } else {
      index = 0;
    }
    app.innerHTML = populate(data[index]);
    socket.emit("page", index);
  });

  on(elem, 'prev-page', () => {
    if (index > 0) {
      index -= 1;
    } else {
      index = data.length - 1;
    }
    app.innerHTML = populate(data[index]);
    socket.emit("page", index);
  });

  app.innerHTML = populate(data[index]);
}

if (curShift) {
  main(curShift);
}

if (Storage.get("password")) {
  password.value = Storage.get("password");
}

const twoHoursInSeconds = 60 * 60 * 2;

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
    Storage.set("password", password.value, twoHoursInSeconds);
    // window.sessionStorage.setItem('password', password.value);
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
      Storage.set("shift", data, twoHoursInSeconds);
      main(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
