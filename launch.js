// One switch for launch day. Default is off.
// While LAUNCH is false, the launch pages stay unlinked and the
// buttons still say "Join the waitlist".
// Set LAUNCH to true, and paste the Gumroad link into GET_URL.
// See README, "The LAUNCH flag".
var LAUNCH = false;
var GET_URL = "";

(function () {
  function apply() {
    if (!LAUNCH) return;
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
