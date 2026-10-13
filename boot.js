// Runs before first paint. Marks the page as scripted, and shows the start-up screen
// on the first visit of a browser session (never with reduced motion).
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen = true;
  try {
    seen = window.sessionStorage.getItem("chiefly-boot") === "1";
    window.sessionStorage.setItem("chiefly-boot", "1");
  } catch (e) {
    seen = true;
  }
  if (!reduce && !seen) root.classList.add("booting");
})();
