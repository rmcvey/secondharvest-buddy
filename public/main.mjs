import Camera from "./lib/Camera.mjs";
import Storage from "./storage.mjs";
import { $, delegate } from './lib/dom.mjs';

const HIDE = "hide";

const video = $("video");
const canvas = $("canvas");
const form = $("#upload-form");
const password = $('input[type="password"]', form);
const fileInput = $("#file-input");
const app = $("#app");
let curShift = Storage.get("shift");

const elem = document.createElement('footer-nav');
elem.id = 'nav';

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
      <a class="address" href="https://www.google.com/maps/search/?${searchParams}">${address}</a>
      <br /><br /><br />
      <div id="phone-lang">
        <a class="phone" href="tel:+1${phone}"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false" class=" NMm5M"><path d="M16.02 14.46l-2.62 2.62a16.141 16.141 0 0 1-6.5-6.5l2.62-2.62a.98.98 0 0 0 .27-.9L9.15 3.8c-.1-.46-.51-.8-.98-.8H4.02c-.56 0-1.03.47-1 1.03a17.92 17.92 0 0 0 2.43 8.01 18.08 18.08 0 0 0 6.5 6.5 17.92 17.92 0 0 0 8.01 2.43c.56.03 1.03-.44 1.03-1v-4.15c0-.48-.34-.89-.8-.98l-3.26-.65c-.33-.07-.67.04-.91.27z"></path></svg> ${phone}</a>
        <span class="language">${language || "English"}</span>
      </div>
      <br /><br />
      <p>${instructions.replace(/["]{2,}/g, '"')}</p>
      <div id="capture-container">
        <div aria-role="button" id="camera-launch">
          <svg id="camera-icon" class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M4 18V8c0-.6.4-1 1-1h1.5l1.7-1.7c.2-.2.4-.3.7-.3h6.2c.3 0 .5.1.7.3L17.5 7H19c.6 0 1 .4 1 1v10c0 .6-.4 1-1 1H5a1 1 0 0 1-1-1Z"/>
            <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
          </svg>
          <svg class="w-6 h-6 text-gray-800 dark:text-white hide" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
    <path fill-rule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm13.7-1.3a1 1 0 0 0-1.4-1.4L11 12.6l-1.8-1.8a1 1 0 0 0-1.4 1.4l2.5 2.5c.4.4 1 .4 1.4 0l4-4Z" clip-rule="evenodd"/>
  </svg>
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

delegate("click", "#app", "#camera-icon", launchCamera);
delegate("click", "#app", "#camera-snap", () => cam && cam.snap());

const join = $("#join");

function main(data) {
  form.classList.add(HIDE);
  app.classList.remove(HIDE);
  join.classList.remove(HIDE);

  join.addEventListener("click", async () => {
    const response = await fetch("/qr").then((res) => res.json());
    $("#qrcode").src = response.qr;
    $(".modal").classList.remove("hide");
  });

  elem.addEventListener('next-page', () => {
    if (index < data.length - 1) {
      index += 1;
    } else {
      index = 0;
    }
    app.innerHTML = populate(data[index]);
    socket.emit("page", index);
  });
  elem.addEventListener('prev-page', () => {
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

form.addEventListener("submit", function (event) {
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
