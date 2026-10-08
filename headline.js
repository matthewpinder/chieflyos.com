// Adds the second headline only after boot.js has chosen one. The page source
// keeps the original line, so a crawler that does not run this file never sees the test.
(function () {
  if (document.documentElement.dataset.headline !== "2") return;
  var h1 = document.getElementById("hero-title");
  if (!h1 || h1.querySelector(".hl-2")) return;
  var line = document.createElement("span");
  line.className = "hl hl-2";
  var top = document.createElement("span");
  top.className = "rise d1";
  top.textContent = "Your own AI.";
  var sub = document.createElement("span");
  sub.className = "tone rise d2";
  sub.textContent = "On your own computer.";
  line.append(top, sub);
  h1.appendChild(line);
})();
