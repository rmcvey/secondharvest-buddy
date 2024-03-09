import Storage from './storage.mjs';

const HIDE = "hide";
const form = document.getElementById("upload-form");
const password = form.querySelector('input[type="password"]');
const fileInput = document.getElementById("file-input");
const app = document.querySelector("#app");
let curShift = Storage.get('shift');



function populate(row) {
  const name = row["First Name"];
  const instructions = row["Delivery Instructions"] ?? '';
  const { City: city, Language: language, Phone: phone, Street: address, Zip: zip } = row;
  const searchParams = new URLSearchParams({
    api: 1,
    query: `${address} ${city}, ${zip}`,
  });

  return /* html */`
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
      <p>${(instructions).replace(/["]{2,}/g, '"')}</p>
    </div>
  `;
}

let index = 0;
let shiftLength = 0;

function main(data) {
  form.classList.add(HIDE);
  document.querySelector("footer").classList.remove(HIDE);
  app.classList.remove(HIDE);
  const [left, right] = Array.from(document.querySelectorAll("footer span"));
  left.addEventListener("click", (e) => {
    if (index > 0) {
      index -= 1;
    } else {
      index = data.length - 1;
    }
    app.innerHTML = populate(data[index]);
  });
  right.addEventListener("click", (e) => {
    if (index < data.length - 1) {
      index += 1;
    } else {
      index = 0;
    }
    app.innerHTML = populate(data[index]);
  });
  app.innerHTML = populate(data[index]);
}



if (curShift) {
  main(curShift);
}

if (Storage.get('password')) {
  password.value = Storage.get('password');
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
    Storage.set('password', password.value, twoHoursInSeconds);
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
      Storage.set('shift', data, twoHoursInSeconds);
      main(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});