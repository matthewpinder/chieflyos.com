// One switch for launch day. Default is off.
// While LAUNCH is false:
// - Download, Welcome, Terms, Support, and Leave stay unlinked.
// - /welcome, /download, /terms, and /leave send the browser home.
// - buttons still say "Join the waitlist".
// Those four pages also carry noindex, and a noscript refresh for
// browsers with JavaScript off. On launch day, set LAUNCH to true,
// remove noindex and the noscript refresh on each of those pages,
// add them to the sitemap, and paste the Gumroad link into GET_URL.
// See README, "The LAUNCH flag".
var LAUNCH = false;
var GET_URL = "";

(function () {
  function pagePath() {
    var path = location.pathname || "/";
    path = path.replace(/\/index\.html$/, "");
    if (path.length > 1 && path.charAt(path.length - 1) === "/") path = path.slice(0, -1);
    return path;
  }

  if (!LAUNCH) {
    var path = pagePath();
    if (path === "/welcome" || path === "/download" || path === "/terms" || path === "/leave") {
      location.replace("/");
      return;
    }
  }

  function apply() {
    if (!LAUNCH) return;
    document.documentElement.classList.add("launched");
    var href = GET_URL || "/download";
    var links = document.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      if (links[i].textContent.trim() !== "Join the waitlist") continue;
      if (links[i].hasAttribute("data-launch-link")) continue;
      links[i].textContent = "Get Chiefly";
      links[i].setAttribute("href", href);
    }
    var gated = document.querySelectorAll("[data-launch-link]");
    for (var j = 0; j < gated.length; j++) gated[j].hidden = false;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
