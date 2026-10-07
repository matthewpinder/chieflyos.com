"use strict";

// Sign-ups go to the waitlist table. This is the publishable key: it can only add an email.
// Nobody can read, change or delete the list with it (row-level security, insert only).
const WAITLIST_URL = "https://bxnavqtqcyrwmhqxjozo.supabase.co/rest/v1/waitlist";
const WAITLIST_KEY = "sb_publishable_I_EwFefK-abwVLJJj0lPzQ_aWjRVuUL";

const root = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const mix = (a, b, t) => a + (b - a) * t;
const ramp = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const rgb = (a, b, t) => `rgb(${Math.round(mix(a[0], b[0], t))},${Math.round(mix(a[1], b[1], t))},${Math.round(mix(a[2], b[2], t))})`;

const DIM = [58, 58, 60];
const LIT = [245, 245, 247];
const PAST = [134, 134, 139];

// ---------- start-up screen ----------
function startUp() {
  const ready = () => requestAnimationFrame(() => root.classList.add("ready"));
  if (!root.classList.contains("booting")) return ready();
  let over = false;
  const end = () => {
    if (over) return;
    over = true;
    clearTimeout(timer);
    for (const ev of SKIP) removeEventListener(ev, end);
    root.classList.add("boot-out");
    setTimeout(() => root.classList.remove("booting", "boot-out"), 420);
    ready();
  };
  const SKIP = ["keydown", "pointerdown", "wheel", "touchstart"];
  const timer = setTimeout(end, 1500);
  for (const ev of SKIP) addEventListener(ev, end, { passive: true });
}

// ---------- the reactor ----------
// Drawn on a 400×400 space. power 0 = off (grey dashes, still), 1 = on (cyan, turning, core lit).
class Reactor {
  constructor(canvas, power) {
    this.canvas = canvas;
    this.g = canvas.getContext("2d");
    this.power = power;
    this.live = canvas.hasAttribute("data-live") && !reduce;
    this.angles = [0.3, 1.1, 2.0];
    this.visible = false;
    this.raf = 0;
    this.last = 0;
    this.tick = this.tick.bind(this);
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      this.run();
    }).observe(canvas);
    document.addEventListener("visibilitychange", () => this.run());
  }

  resize() {
    const w = this.canvas.getBoundingClientRect().width;
    const px = Math.round(w * Math.min(window.devicePixelRatio || 1, 2));
    if (!px) return;
    if (this.canvas.width !== px) this.canvas.width = this.canvas.height = px;
    this.draw(performance.now(), 0);
  }

  set(power) {
    if (Math.abs(power - this.power) < 0.0005) return;
    this.power = power;
    if (!this.raf) this.draw(performance.now(), 0);
  }

  run() {
    const go = this.live && this.visible && !document.hidden;
    if (go && !this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  tick(t) {
    const dt = Math.min(64, t - this.last);
    this.last = t;
    this.draw(t, dt);
    this.raf = this.live && this.visible && !document.hidden ? requestAnimationFrame(this.tick) : 0;
  }

  draw(t, dt) {
    const { g, canvas, power: p } = this;
    const s = canvas.width / 400;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(s, 0, 0, s, 0, 0);
    g.lineCap = "butt";

    const speed = ramp(0.3, 1, p);
    for (let i = 0; i < 3; i++) {
      this.angles[i] += ((dt * speed) / (2600 + i * 900)) * (i % 2 ? -1 : 1);
      const lit = ramp(i * 0.16, i * 0.16 + 0.3, p);
      g.strokeStyle = `rgba(${Math.round(mix(255, 56, lit))},${Math.round(mix(255, 214, lit))},255,${mix(0.07, 0.42, lit).toFixed(3)})`;
      g.lineWidth = 2;
      const r = 190 - i * 28;
      for (let k = 0; k < 12; k++) {
        const a = this.angles[i] + (k * Math.PI) / 6;
        g.beginPath();
        g.arc(200, 200, r, a, a + Math.PI / 12);
        g.stroke();
      }
    }

    const ring = ramp(0.5, 0.72, p);
    g.strokeStyle = `rgba(${Math.round(mix(255, 56, ring))},${Math.round(mix(255, 214, ring))},255,${mix(0.06, 0.7, ring).toFixed(3)})`;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(200, 200, 58, 0, Math.PI * 2);
    g.stroke();

    const core = ramp(0.62, 1, p);
    if (core > 0) {
      const breathe = 1 + 0.04 * Math.sin((t / 5000) * Math.PI * 2) * (this.live ? 1 : 0);
      const R = 74 * breathe;
      const grad = g.createRadialGradient(200, 200, 5, 200, 200, R);
      grad.addColorStop(0, `rgba(224,248,255,${(0.85 * core).toFixed(3)})`);
      grad.addColorStop(0.4, `rgba(56,214,255,${(0.47 * core).toFixed(3)})`);
      grad.addColorStop(1, "rgba(56,214,255,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(200, 200, R, 0, Math.PI * 2);
      g.fill();
    }
  }
}

// ---------- scroll scenes ----------
const scenes = [];
let queued = false;
function frame() {
  queued = false;
  const vh = window.innerHeight;
  for (const scene of scenes) scene(vh);
}
function schedule() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(frame);
  }
}

function powerScene(section, reactor) {
  const wrap = section.querySelector(".reactor-wrap");
  const bloom = section.querySelector(".bloom");
  return (vh) => {
    const r = section.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - vh));
    const on = ramp(0.06, 0.8, p);
    const lift = ramp(0, 0.85, p);
    wrap.style.transform = `translateY(${mix(60, 0, lift).toFixed(1)}px) scale(${mix(0.86, 1, lift).toFixed(4)})`;
    bloom.style.opacity = ramp(0.62, 1, on).toFixed(3);
    reactor.set(on);
  };
}

// Each line brightens as it reaches the middle of the screen, then settles to grey above it.
function linesScene(lines) {
  return (vh) => {
    for (const li of lines) {
      const r = li.getBoundingClientRect();
      const d = (r.top + r.height / 2 - vh / 2) / (vh / 2);
      li.style.color = d >= 0 ? rgb(DIM, LIT, 1 - ramp(0.05, 0.7, d)) : rgb(LIT, PAST, ramp(0.1, 0.55, -d));
    }
  };
}

// The vision line lights up word by word as it scrolls through.
function wordsScene(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  const spans = words.map((w, i) => {
    const s = document.createElement("span");
    s.className = "w";
    s.textContent = w;
    el.append(s, i < words.length - 1 ? " " : "");
    return s;
  });
  return (vh) => {
    const r = el.getBoundingClientRect();
    const p = clamp((vh * 0.82 - r.top) / (vh * 0.82 - vh * 0.28));
    const n = spans.length;
    spans.forEach((s, i) => {
      s.style.color = rgb(DIM, LIT, clamp(p * (n + 2) - i));
    });
  };
}

function reveals() {
  const els = document.querySelectorAll(".reveal");
  if (reduce) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

// ---------- waitlist ----------
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAY = {
  done: "You’re on the list. We’ll be in touch.",
  dup: "You’re already on the list. We’ll be in touch.",
  bad: "That email doesn’t look right.",
  error: "Something went wrong. Please try again.",
};

async function join(email, source) {
  try {
    const res = await fetch(WAITLIST_URL, {
      method: "POST",
      headers: { apikey: WAITLIST_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ email, source }),
      signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(15000) : undefined,
    });
    if (res.ok) return "done";
    const body = await res.json().catch(() => ({}));
    if (res.status === 409 || body.code === "23505") return "dup";
    if (body.code === "23514") return "bad";
    return "error";
  } catch {
    return "error";
  }
}

function waitlist(form) {
  const input = form.querySelector(".field");
  const trap = form.querySelector(".hp");
  const button = form.querySelector("button");
  const row = form.querySelector(".wl-row");
  const msg = form.querySelector(".wl-msg");
  const label = button.textContent;

  const finish = (text) => {
    row.hidden = true;
    msg.className = "wl-msg ok";
    msg.textContent = text;
  };
  const fail = (text, invalid) => {
    if (invalid) input.setAttribute("aria-invalid", "true");
    msg.className = "wl-msg";
    msg.textContent = text;
  };

  input.addEventListener("input", () => {
    if (!input.hasAttribute("aria-invalid")) return;
    input.removeAttribute("aria-invalid");
    msg.textContent = "";
  });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (button.disabled) return;
    const email = input.value.trim().toLowerCase();
    if (email.length > 254 || !EMAIL.test(email)) {
      fail(SAY.bad, true);
      input.focus();
      return;
    }
    if (trap.value) return finish(SAY.done);
    button.disabled = true;
    button.textContent = "Joining…";
    msg.textContent = "";
    const result = await join(email, form.dataset.source);
    button.disabled = false;
    button.textContent = label;
    if (result === "done" || result === "dup") return finish(SAY[result]);
    fail(SAY[result], result === "bad");
  });
}

// ---------- go ----------
startUp();
document.querySelectorAll("form.wl").forEach(waitlist);
reveals();

const reactors = new Map();
document.querySelectorAll("canvas[data-power]").forEach((c) => {
  reactors.set(c, new Reactor(c, reduce ? 1 : Number(c.dataset.power)));
});

if (!reduce) {
  const power = document.querySelector(".power");
  scenes.push(powerScene(power, reactors.get(power.querySelector("canvas"))));
  scenes.push(linesScene([...document.querySelectorAll(".lines li")]));
  scenes.push(wordsScene(document.querySelector(".big")));
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  frame();
}
