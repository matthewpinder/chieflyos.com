// Product-launch gate.
// /privacy does not load this file, so that page stays public.
// /terms loads it. While LAUNCH is false, leave /terms unlinked,
// out of the sitemap, and disallowed in robots.txt.
var LAUNCH = false;

(function () {
  var page = document.querySelector("[data-launch-page]");
  if (!page || !LAUNCH) return;
  var held = document.getElementById("launch-held");
  var copy = document.getElementById("launch-copy");
  if (held) held.hidden = true;
  if (copy) copy.hidden = false;
})();
