import Storage from "./lib/storage.mjs";

import { $, delegate, on } from "./lib/dom.mjs";

const HIDE = "hide";
const MAP_BASE = "https://www.google.com/maps/search";
const TWO_HOURS = 60 * 60 * 2;

const $footerMenu = $("#nav");
const $detail = $("#clientDetail");
const $form = $("#upload-form");
const $tprog = $("#top-progress");
const $password = $('input[type="password"]', $form);
const $fileInput = $("#file-input");
const $app = $("#app");

let curShift = Storage.get("shift");

// todo allow selection
const params = new URLSearchParams({
  hl: "en",
  sl: "en",
  text: "Food bank",
  op: "translate",
});

const translateLink = "https://translate.google.com";

const languages = {
  spanish: "es",
  vietnamese: "vi",
  english: "en",
  chinese: "zh-CN",
};

function guessLang(lang) {
  for (const [language, short] of Object.entries(languages)) {
    if (lang.toLowerCase().includes(language)) {
      return short;
    }
  }
  return "es";
}

// TODO: make webcomponent
function renderRow(row) {
  const name = row["First Name"];
  const instructions = row["Delivery Instructions"] ?? "";
  const {
    City: city,
    Language: lang,
    Phone: phone,
    Street: address,
    Zip: zip,
  } = row;

  const searchParams = new URLSearchParams({
    api: 1,
    query: `${address} ${city}, ${zip}`.trim(),
  });

  const language = guessLang(lang);
  params.set("tl", lang);
  Storage.set("index", currentClient, TWO_HOURS);

  const props = {
    name,
    address,
    city,
    zip,
    phone,
    language,
    instructions,
    index: currentClient,
    total: curShift.length,
  };

  Object.entries(props).forEach(([prop, value]) => {
    $detail.setAttribute(prop, value);
  });
}

let currentClient = Storage.get("index", 0);

function main(clients) {
  $form.classList.add(HIDE);
  $app.classList.remove(HIDE);
  $footerMenu.classList.remove(HIDE);

  const prog = document.createElement("task-progression");
  const updateProgress = (count, current) => {
    [$tprog, prog].forEach((el) => {
      el.setAttribute("count", count);
      el.setAttribute("current", current);
    });
  };

  on($footerMenu, "next-page", () => {
    if (currentClient < clients.length - 1) {
      currentClient += 1;
    } else {
      currentClient = 0;
    }
    renderRow(clients[currentClient]);
    updateProgress(clients.length, currentClient);
  });

  on($footerMenu, "prev-page", () => {
    if (currentClient > 0) {
      currentClient -= 1;
    } else {
      currentClient = clients.length - 1;
    }
    renderRow(clients[currentClient]);
    updateProgress(clients.length, currentClient);
  });

  Storage.set("index", currentClient, TWO_HOURS);
  renderRow(clients[currentClient]);
  updateProgress(clients.length, currentClient);
  document.body.insertBefore(prog, $footerMenu);
}

on($form, "submit", function (event) {
  event.preventDefault();
  $form.querySelector("aside.hide").classList.remove(HIDE);
  // Check if the file is a PDF
  const file = $fileInput.files[0];
  if (file.type !== "application/pdf") {
    alert("Please select a PDF file.");
    return;
  }

  if ($password) {
    Storage.set("password", $password.value, TWO_HOURS);
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append("password", $password.value);
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

if (curShift) {
  main(curShift);
}

if (Storage.get("password")) {
  $password.value = Storage.get("password");
}
