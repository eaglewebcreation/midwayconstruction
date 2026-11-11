/* Midway Construction & Dirtwork: site behavior. No libraries. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- mobile menu ---- */
  var menuBtn = $(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }

  /* ---- floating dial (phones) ---- */
  var dial = $(".dial");
  if (dial) {
    var dBtn = $("button", dial);
    dBtn.addEventListener("click", function () {
      var open = dial.classList.toggle("open");
      dBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!dial.contains(e.target)) { dial.classList.remove("open"); dBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- grade rod + hazard progress ---- */
  var rod = $(".rod"), receiver = rod && $(".receiver", rod), reading = rod && $(".reading", rod);
  var prog = $(".hazard-progress");
  var stages = $$("[data-stage]");
  var ticking = false, hideTimer;
  function onScroll() {
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var p = Math.min(1, Math.max(0, window.scrollY / max));
    if (prog) prog.style.transform = "scaleX(" + p + ")";
    if (rod && receiver) {
      var h = rod.clientHeight - receiver.offsetHeight;
      receiver.style.top = (p * h) + "px";
      if (reading) {
        reading.style.top = (p * h + 12) + "px";
        var cur = null, mid = window.innerHeight * 0.45;
        stages.forEach(function (s) { if (s.getBoundingClientRect().top < mid) cur = s; });
        if (cur) reading.textContent = cur.getAttribute("data-stage");
        rod.classList.add("show-reading");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function () { rod.classList.remove("show-reading"); }, 1400);
      }
    }
    ticking = false;
  }
  if (rod || prog) {
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    if (rod) rod.classList.remove("show-reading");
  }

  /* ---- reveal on scroll ---- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- cross-section: subgrade to finish ---- */
  var xsec = $(".xsec");
  if (xsec) {
    var svg = $(".xsvg", xsec);
    var tabs = $$(".steps button", xsec);
    var panel = $(".panel", xsec);
    var pImg = $("img", panel), pTitle = $("h3", panel), pText = $("p", panel), pLink = $("a", panel);
    var current = -1, auto = null, interacted = false, built = false;
    var DUR = 5200;
    function show(i, fromUser) {
      if (i === current) return;
      current = i;
      var t = tabs[i];
      tabs.forEach(function (b, k) {
        b.setAttribute("aria-selected", k === i ? "true" : "false");
        b.tabIndex = k === i ? 0 : -1;
        var tm = $(".timer", b);
        if (tm) { tm.style.transition = "none"; tm.style.transform = "scaleX(0)"; }
      });
      svg.classList.add("focus");
      $$(".lyr", svg).forEach(function (l) { l.classList.toggle("on", l.getAttribute("data-step") === String(i)); });
      panel.classList.remove("live");
      var src = t.getAttribute("data-img");
      pImg.onload = function () { requestAnimationFrame(function () { panel.classList.add("live"); }); };
      pImg.src = src.replace(/\.jpg$/, ".webp");
      pImg.alt = t.getAttribute("data-alt");
      pTitle.textContent = t.getAttribute("data-title");
      pText.textContent = t.getAttribute("data-text");
      pLink.href = t.getAttribute("data-href");
      pLink.textContent = t.getAttribute("data-link");
      if (!fromUser && !reduce) {
        var tm2 = $(".timer", t);
        if (tm2) { void tm2.offsetWidth; tm2.style.transition = "transform " + DUR + "ms linear"; tm2.style.transform = "scaleX(1)"; }
      }
    }
    function startAuto() {
      if (reduce || interacted) return;
      stopAuto();
      auto = setInterval(function () { show((current + 1) % tabs.length); }, DUR);
    }
    function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
    function userPick(i) {
      interacted = true; stopAuto();
      tabs.forEach(function (b) { var tm = $(".timer", b); if (tm) { tm.style.transition = "none"; tm.style.transform = "scaleX(0)"; } });
      current = -1; show(i, true);
    }
    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () { userPick(i); });
      b.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % tabs.length;
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
        if (n !== null) { e.preventDefault(); userPick(n); tabs[n].focus(); }
      });
    });
    $$(".lyr", svg).forEach(function (l) {
      l.addEventListener("click", function () { userPick(parseInt(l.getAttribute("data-step"), 10)); });
    });
    show(0, true);
    svg.classList.remove("focus");
    if ("IntersectionObserver" in window && !reduce) {
      var xo = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) {
            if (!built) { built = true; xsec.classList.add("built", "building"); setTimeout(function () { xsec.classList.remove("building"); if (!interacted) { current = -1; show(0); startAuto(); } }, 1900); return; }
            startAuto();
          } else { stopAuto(); }
        });
      }, { threshold: 0.3 });
      xo.observe(xsec);
    } else { xsec.classList.add("built"); }
  }

  /* ---- "how many outfits" work order ---- */
  var wo = $(".work-order");
  if (wo) {
    var boxes = $$("input[type=checkbox]", wo);
    var themNum = $(".meter.them .num"), themList = $(".meter.them ul"), usNum = $(".meter.us .num");
    var sendLink = $(".send-list");
    var shown = 0;
    function animateNum(el, to) {
      var from = parseInt(el.textContent, 10) || 0;
      if (reduce || from === to) { el.textContent = to; return; }
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var k = Math.min(1, (ts - start) / 450);
        el.textContent = Math.round(from + (to - from) * k);
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    function update() {
      var picked = boxes.filter(function (b) { return b.checked; });
      var trades = {};
      picked.forEach(function (b) { b.getAttribute("data-trades").split("|").forEach(function (t) { trades[t] = 1; }); });
      var names = Object.keys(trades);
      animateNum(themNum, names.length);
      themList.innerHTML = names.length ? names.map(function (n) { return "<li>" + n + "</li>"; }).join("") : "<li>Tick a job to see who you'd be calling.</li>";
      animateNum(usNum, picked.length ? 1 : 0);
      shown = picked.length;
      var needs = picked.map(function (b) { return b.value; }).join(",");
      sendLink.href = "/contact" + (needs ? "?needs=" + encodeURIComponent(needs) : "") + "#estimate";
      sendLink.querySelector("span").textContent = picked.length ? "Send this list to Pete" : "Get a free estimate";
    }
    boxes.forEach(function (b) { b.addEventListener("change", update); });
    update();
  }

  /* ---- job ticket strip: drag + arrows ---- */
  $$(".strip").forEach(function (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; strip.classList.add("dragging"); }
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", function () { down = false; setTimeout(function () { strip.classList.remove("dragging"); }, 0); });
    var sec = strip.closest("section");
    var prev = sec && $(".strip-prev", sec), next = sec && $(".strip-next", sec);
    function by(d) { var card = $(".ticket", strip); var w = card ? card.offsetWidth + 26 : 360; strip.scrollBy({ left: d * w, behavior: reduce ? "auto" : "smooth" }); }
    if (prev) prev.addEventListener("click", function () { by(-1); });
    if (next) next.addEventListener("click", function () { by(1); });
  });

  /* ---- before / after slider ---- */
  $$(".ba").forEach(function (ba) {
    var r = $("input[type=range]", ba);
    function set() { ba.style.setProperty("--pos", r.value + "%"); }
    r.addEventListener("input", set);
    set();
    if (!reduce && "IntersectionObserver" in window) {
      var done = false;
      var bo = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !done) {
          done = true;
          var t0 = null;
          (function sweep(ts) {
            if (!t0) t0 = ts;
            var k = (ts - t0) / 1600;
            if (k >= 1) { r.value = 50; set(); return; }
            r.value = 50 + Math.sin(k * Math.PI * 2) * 30; set();
            requestAnimationFrame(sweep);
          })(performance.now());
          bo.disconnect();
        }
      }, { threshold: 0.6 });
      bo.observe(ba);
    }
  });

  /* ---- reviews rotator ---- */
  var revSec = $(".reviews-sec");
  if (revSec) {
    var revs = $$(".rev", revSec), dots = $$(".rev-nav button", revSec), ri = 0, rt = null;
    function showRev(i) {
      ri = i;
      revs.forEach(function (r, k) { r.classList.toggle("on", k === i); r.setAttribute("aria-hidden", k === i ? "false" : "true"); });
      dots.forEach(function (d, k) {
        d.classList.remove("on", "done");
        if (k < i) d.classList.add("done");
        d.setAttribute("aria-current", k === i ? "true" : "false");
      });
      var d = dots[i]; void d.offsetWidth; d.classList.add("on");
      clearTimeout(rt);
      if (!reduce) rt = setTimeout(function () { showRev((ri + 1) % revs.length); }, 7000);
    }
    dots.forEach(function (d, k) { d.addEventListener("click", function () { showRev(k); }); });
    revSec.addEventListener("mouseenter", function () { revSec.classList.add("paused"); clearTimeout(rt); });
    revSec.addEventListener("mouseleave", function () { revSec.classList.remove("paused"); showRev(ri); });
    showRev(0);
  }

  /* ---- jump bar on services ---- */
  var jump = $(".jump");
  if (jump && "IntersectionObserver" in window) {
    var links = $$("a", jump);
    var jo = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) {
            var on = a.getAttribute("href") === "#" + e.target.id;
            a.classList.toggle("on", on);
            if (on && a.scrollIntoView) { var ul = a.closest("ul"); ul.scrollTo({ left: a.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" }); }
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".svc[id]").forEach(function (s) { jo.observe(s); });
  }

  /* ---- gallery filters + lightbox ---- */
  var gal = $(".gallery");
  if (gal) {
    var items = $$(".g", gal);
    $$(".filters button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var f = b.getAttribute("data-filter");
        items.forEach(function (it) { it.classList.toggle("hide", f !== "all" && it.getAttribute("data-cat").indexOf(f) === -1); });
      });
    });
    var lb = $(".lightbox"), lbImg = $("img", lb), lbCap = $("p", lb), li = 0, lastFocus = null;
    function visible() { return items.filter(function (it) { return !it.classList.contains("hide"); }); }
    function openLb(it) {
      var vis = visible(); li = vis.indexOf(it);
      var im = $("img", it);
      lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt;
      lbCap.textContent = it.getAttribute("data-caption") || "";
      lastFocus = document.activeElement;
      lb.classList.add("open"); $(".lb-close", lb).focus();
    }
    function step(d) { var vis = visible(); li = (li + d + vis.length) % vis.length; openLb(vis[li]); }
    function closeLb() { lb.classList.remove("open"); if (lastFocus) lastFocus.focus(); }
    items.forEach(function (it) { it.addEventListener("click", function () { openLb(it); }); });
    $(".lb-close", lb).addEventListener("click", closeLb);
    $(".lb-prev", lb).addEventListener("click", function () { step(-1); });
    $(".lb-next", lb).addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* ---- estimate form: preview only, sends nothing ---- */
  var form = $("#estimate-form");
  if (form) {
    try {
      var q = new URLSearchParams(location.search).get("needs");
      if (q) q.split(",").forEach(function (v) { var c = form.querySelector('input[name="needs"][value="' + v.replace(/[^a-z-]/g, "") + '"]'); if (c) c.checked = true; });
    } catch (e) { /* old browser, skip prefill */ }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $(".notice", form.parentNode);
      n.classList.add("show");
      n.focus();
    });
  }

  /* ---- year ---- */
  $$(".yr").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
