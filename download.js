// Picks the big download button for this computer. The other OS stays a link.
(function () {
  var root = document.querySelector("[data-download]");
  if (!root) return;

  function os() {
    var ua = navigator.userAgent || "";
    var plat = "";
    if (navigator.userAgentData && navigator.userAgentData.platform) plat = navigator.userAgentData.platform;
    else plat = navigator.platform || "";
    var touch = navigator.maxTouchPoints > 1;
    if (/win/i.test(plat) || /Windows/.test(ua)) return "windows";
    // iPad reports a Mac platform and a touch screen. A Mac does not.
    if ((/mac/i.test(plat) || /Macintosh|Mac OS X/.test(ua)) && !touch) return "mac";
    return "";
  }

  function show(name) {
    var buttons = root.querySelectorAll("[data-primary]");
    var alts = root.querySelectorAll("[data-alt]");
    var both = root.querySelector("[data-both]");
    var i;
    if (!name) {
      for (i = 0; i < buttons.length; i++) buttons[i].hidden = false;
      for (i = 0; i < alts.length; i++) alts[i].hidden = true;
      if (both) both.hidden = false;
      return;
    }
    for (i = 0; i < buttons.length; i++) buttons[i].hidden = buttons[i].getAttribute("data-primary") !== name;
    for (i = 0; i < alts.length; i++) alts[i].hidden = alts[i].getAttribute("data-alt") !== name;
    if (both) both.hidden = true;
  }

  show(os());

  root.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var pick = t.closest("[data-pick]");
    if (!pick || !root.contains(pick)) return;
    e.preventDefault();
    show(pick.getAttribute("data-pick"));
    var live = root.querySelector("[data-primary]:not([hidden])");
    if (live) live.focus();
  });
})();
