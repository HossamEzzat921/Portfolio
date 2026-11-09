/* Hossam Ezzat — portfolio interactions (vanilla, no deps) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  var toggle = document.getElementById("themeToggle");
  toggle.addEventListener("click", function () {
    var next = doc.dataset.theme === "light" ? "dark" : "light";
    doc.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content = next === "light" ? "#efe9dd" : "#0f0e0c";
    try { localStorage.setItem("he-theme", next); } catch (e) { /* storage unavailable */ }
  });

  /* ---------- Cairo clock ---------- */
  var clock = document.getElementById("clock");
  var fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" });
  function tick() { clock.textContent = fmt.format(new Date()); }
  tick();
  setInterval(tick, 15000);

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      burger.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }
  });

  /* ---------- Scroll progress + active nav ---------- */
  var bar = document.querySelector(".progress span");
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var ticking = false;
  function onScroll() {
    var max = document.body.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    var mid = window.innerHeight * 0.4;
    sections.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      links[i].classList.toggle("is-active", r.top <= mid && r.bottom > mid);
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Reveal + counters ---------- */
  function countUp(el) {
    var target = +el.dataset.count;
    if (reduce || !target) return;
    var start = null, dur = 1400;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Archive cursor peek ---------- */
  var peek = document.getElementById("peek");
  var peekImg = peek.querySelector("img");
  var archive = document.getElementById("archive");
  var px = 0, py = 0, tx = 0, ty = 0, raf = null;
  function follow() {
    px += (tx - px) * 0.18;
    py += (ty - py) * 0.18;
    peek.style.left = px + "px";
    peek.style.top = py + "px";
    raf = Math.abs(tx - px) + Math.abs(ty - py) > 0.5 ? requestAnimationFrame(follow) : null;
  }
  archive.querySelectorAll("li").forEach(function (li) {
    li.addEventListener("mouseenter", function () {
      peekImg.src = li.dataset.img;
      peek.classList.add("is-on");
    });
    li.addEventListener("mouseleave", function () { peek.classList.remove("is-on"); });
  });
  archive.addEventListener("mousemove", function (e) {
    tx = e.clientX + 170; ty = e.clientY;
    if (reduce) { px = tx; py = ty; peek.style.left = px + "px"; peek.style.top = py + "px"; return; }
    if (!raf) raf = requestAnimationFrame(follow);
  });

  /* ---------- Skills with receipts ---------- */
  var SKILLS = [
    ["React", ["wahy", "kova", "lalola", "learnhub", "archive"]],
    ["TypeScript", ["wahy", "kova", "lalola"]],
    ["TanStack Start", ["wahy", "kova", "lalola"]],
    ["Supabase / Postgres", ["wahy", "kova", "lalola"]],
    ["Auth & roles", ["wahy", "kova", "lalola", "learnhub"]],
    ["Admin dashboards", ["wahy", "kova", "lalola", "learnhub"]],
    ["Payments & checkout", ["wahy", "kova", "lalola"]],
    ["Booking & scheduling", ["wahy"]],
    ["In-app chat", ["wahy"]],
    ["Shipping & orders", ["kova", "lalola"]],
    ["Node & Express", ["learnhub"]],
    ["MongoDB", ["learnhub"]],
    ["REST APIs", ["learnhub", "archive"]],
    ["Tailwind CSS", ["wahy", "kova", "lalola", "learnhub", "archive"]],
    ["Vue.js", ["archive"]],
    ["Firebase", ["archive"]]
  ];
  var NAMES = { wahy: "WAHY", kova: "KOVA", lalola: "Lalola", learnhub: "LearnHub", archive: "the archive" };
  var wrap = document.getElementById("skills");
  var matrix = wrap.closest(".matrix");
  var proofs = document.querySelectorAll(".proof");
  var hint = document.getElementById("hint");
  var current = null;

  SKILLS.forEach(function (s) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "skill";
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = s[0] + "<small>" + s[1].length + "</small>";
    b.addEventListener("click", function () { select(current === b ? null : b, s); });
    b.addEventListener("mouseenter", function () { if (!current) show(s); });
    b.addEventListener("mouseleave", function () { if (!current) show(null); });
    wrap.appendChild(b);
  });

  function show(s) {
    matrix.classList.toggle("is-filtering", !!s);
    proofs.forEach(function (p) { p.classList.toggle("is-hit", !!s && s[1].indexOf(p.dataset.p) > -1); });
    hint.textContent = s
      ? s[0] + " — proven in " + s[1].map(function (k) { return NAMES[k]; }).join(", ") + "."
      : "Select a skill above ↑";
  }
  function select(btn, s) {
    if (current) current.setAttribute("aria-pressed", "false");
    current = btn;
    if (btn) btn.setAttribute("aria-pressed", "true");
    show(btn ? s : null);
  }

  /* ---------- Contact (opens the visitor's mail app, no backend needed) ---------- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var name = (d.get("name") || "").trim();
    var email = (d.get("email") || "").trim();
    var msg = (d.get("message") || "").trim();
    if (!name || !email || !msg || !form.email.checkValidity()) {
      note.textContent = "Please fill in your name, a valid email and a short message.";
      return;
    }
    var subject = "[" + d.get("type") + "] New project from " + name;
    var body = msg + "\n\n— " + name + " (" + email + ")";
    window.location.href = "mailto:hossamezzat921@gmail.com?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    note.textContent = "Opening your email app… thanks, " + name + "!";
  });

  var copyBtn = document.getElementById("copyEmail");
  var copyLabel = document.getElementById("copyLabel");
  copyBtn.addEventListener("click", function () {
    var email = copyBtn.dataset.email;
    function done(ok) {
      copyLabel.textContent = ok ? "copied ✓" : "opening mail…";
      if (!ok) window.location.href = "mailto:" + email;
      setTimeout(function () { copyLabel.textContent = "copy"; }, 2000);
    }
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });
})();
