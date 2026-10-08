// Runs before first paint. Marks the page as scripted, and shows the start-up screen
// on the first visit of a browser session (never with reduced motion).
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen = true;
  try {
    seen = window.sessionStorage.getItem("jarvis-boot") === "1";
    window.sessionStorage.setItem("jarvis-boot", "1");
  } catch (e) {
    seen = true;
  }
  if (!reduce && !seen) root.classList.add("booting");

  // Sticky headline test. "1" is the original line. "?headline=1" or "2" previews without saving.
  var headline = "1";
  try {
    var preview = new URLSearchParams(location.search).get("headline");
    var crawler = /bot|crawler|spider|slurp|facebookexternalhit|embedly|slack|discord|whatsapp|telegram|linkedin|pinterest|reddit/i.test(navigator.userAgent);
    if (preview === "1" || preview === "2") {
      headline = preview;
    } else if (crawler) {
      headline = "1";
    } else {
      var stored = localStorage.getItem("jarvis-headline");
      if (stored === "1" || stored === "2") headline = stored;
      else {
        headline = Math.random() < 0.5 ? "1" : "2";
        localStorage.setItem("jarvis-headline", headline);
      }
    }
  } catch (e) {}
  root.dataset.headline = headline;
})();
