"use strict";

// One SHA-256 per friend. Hash the code with capital letters, spaces, and
// hyphens removed, as UTF-8, with no extra newline. Add a line to invite
// someone. Delete that one line and redeploy to revoke them. Leave the others.
// Do not put the code itself in this repo. Three sample hashes are listed so
// the page can be tried. Replace them before you invite people. See the README.
const CODE_HASHES = [
  "42689a728141a3a45a939e2f983fe39940c7adc821edb623760f7656b28a1db9",
  "2a7d594db63767c27e57e89e910728d27d78c8922cc21faebf7f6fde08a89bc6",
  "8f68a1b0d366d7d95e0a675c009db2ce41c1a12c9990b118a6dc85e3dce0844b",
];

// Friend-testing installer. It does not live in this repo.
// Upload it to object storage at an unguessable address, then paste that address here.
// This file is the only place that links to it.
const DOWNLOAD_URL = "https://pub-REPLACE.r2.dev/jarvis-friend/REPLACE-WITH-A-LONG-RANDOM-KEY/Jarvis-Setup";

const FAIL_MESSAGE = "That code didn't work.";

const form = document.getElementById("gate-form");
const input = document.getElementById("code");
const button = document.getElementById("continue");
const message = document.getElementById("gate-msg");
const tries = document.getElementById("gate-tries");
const download = document.getElementById("download");
const ready = document.getElementById("ready");

let attempts = 0;
let busy = false;

function canonical(code) {
  return code.trim().toLowerCase().replace(/[\s-]+/g, "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function unlock() {
  if (DOWNLOAD_URL) download.href = DOWNLOAD_URL;
  form.hidden = true;
  ready.hidden = false;
  download.focus();
}

async function reject() {
  attempts += 1;
  message.textContent = FAIL_MESSAGE;
  input.setAttribute("aria-invalid", "true");
  tries.hidden = false;
  tries.textContent = "Tries: " + attempts;
  // Slows repeat tries in the form. Reloading the page starts the count over.
  await sleep(Math.min(700 * attempts, 4000));
  busy = false;
  button.disabled = false;
  input.disabled = false;
  input.focus();
  input.select();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  const code = canonical(input.value);
  busy = true;
  button.disabled = true;
  input.disabled = true;
  if (!code) {
    await reject();
    return;
  }

  let hash = "";
  try {
    hash = await sha256Hex(code);
  } catch (err) {
    await reject();
    return;
  }

  const ok = CODE_HASHES.some((item) => item.toLowerCase() === hash);
  if (ok) {
    input.value = "";
    unlock();
    return;
  }
  await reject();
});
