// Rev Dale Practice Solutions — scripts.js
document.addEventListener("DOMContentLoaded", () => {

  // ── Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Header scroll shadow
  const header = document.getElementById("site-header");
  window.addEventListener("scroll", () => {
    header?.classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });

  // ── Mobile nav toggle
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  navToggle?.addEventListener("click", () => {
    const isOpen = mainNav?.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // ── Close mobile nav on link click
  mainNav?.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // ── FAQ / Accordion
  const faqItems = document.querySelectorAll(".faq-item");

  function closeFaq(item) {
    const btn = item.querySelector(".faq-header");
    const body = item.querySelector(".faq-body");
    item.classList.remove("is-open");
    btn?.setAttribute("aria-expanded", "false");
    if (body) body.style.maxHeight = "0";
  }

  function openFaq(item) {
    const btn = item.querySelector(".faq-header");
    const body = item.querySelector(".faq-body");
    item.classList.add("is-open");
    btn?.setAttribute("aria-expanded", "true");
    if (body) body.style.maxHeight = body.scrollHeight + "px";
  }

  // Init state
  faqItems.forEach(item => {
    const body = item.querySelector(".faq-body");
    if (!body) return;
    if (item.classList.contains("is-open")) {
      body.style.maxHeight = body.scrollHeight + "px";
    } else {
      body.style.maxHeight = "0";
    }
  });

  faqItems.forEach(item => {
    item.querySelector(".faq-header")?.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      faqItems.forEach(closeFaq);
      if (!isOpen) openFaq(item);
    });
  });

  // ── Testimonial Slider
  const slider = document.querySelector(".testimonial-slider");
  const track = slider?.querySelector(".testimonial-track");
  const dotsWrap = document.querySelector(".testimonial-dots");
  const slides = track ? Array.from(track.querySelectorAll(".testimonial")) : [];
  let current = 0;
  let autoTimer;

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "dot" + (i === 0 ? " active" : "");
      d.dataset.index = i;
      d.setAttribute("aria-label", `Slide ${i + 1}`);
      d.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(d);
    });
  }

  function updateDots() {
    dotsWrap?.querySelectorAll(".dot").forEach(d =>
      d.classList.toggle("active", Number(d.dataset.index) === current)
    );
  }

  function layoutSlides() {
    if (!slider || !track) return;
    const w = slider.clientWidth;
    slides.forEach(s => s.style.flex = `0 0 ${w}px`);
    if (typeof gsap !== "undefined") {
      gsap.set(track, { x: -current * w });
    } else {
      track.style.transform = `translateX(${-current * w}px)`;
    }
  }

  function showSlide(index) {
    if (!slider || !track) return;
    const w = slider.clientWidth;
    if (typeof gsap !== "undefined") {
      gsap.killTweensOf(track);
      gsap.to(track, { duration: 0.55, x: -index * w, ease: "power2.out", force3D: true });
    } else {
      track.style.transition = "transform .55s ease";
      track.style.transform = `translateX(${-index * w}px)`;
    }
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    updateDots();
    layoutSlides();
    showSlide(current);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() { autoTimer = setInterval(next, 6000); }
  function stopAuto() { clearInterval(autoTimer); }

  buildDots();
  layoutSlides();
  startAuto();

  window.addEventListener("resize", () => { layoutSlides(); showSlide(current); }, { passive: true });
  document.querySelector(".t-next")?.addEventListener("click", () => { stopAuto(); next(); startAuto(); });
  document.querySelector(".t-prev")?.addEventListener("click", () => { stopAuto(); prev(); startAuto(); });
  dotsWrap?.addEventListener("mouseenter", stopAuto);
  dotsWrap?.addEventListener("mouseleave", startAuto);

  let startX = 0;
  track?.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  track?.addEventListener("touchend", e => {
    let diff = startX - e.changedTouches[0].clientX;
    if (diff > 40) next();
    else if (diff < -40) prev();
    startAuto();
  }, { passive: true });

  // ── Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = anchor.getAttribute("href");
      if (!href) return;
      const target = href === "#" ? document.documentElement : document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      try { if (history?.pushState) history.pushState(null, "", href); } catch (_) { }
      const headerOffset = header ? header.offsetHeight + 8 : 80;
      if (typeof gsap !== "undefined" && typeof ScrollToPlugin !== "undefined") {
        gsap.to(window, { duration: 0.7, ease: "power3.inOut", scrollTo: { y: target, offsetY: headerOffset } });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  // ── GSAP animations on load
  window.addEventListener("load", () => {
    if (typeof gsap === "undefined") return;
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    try { gsap.ticker.lagSmoothing(1000, 16); } catch (_) { }
    gsap.defaults({ ease: "power3.out", overwrite: true });

    // Hero entrance
    gsap.from(".hero-badge", { y: 20, opacity: 0, duration: 0.7, delay: 0.2 });
    gsap.from(".site-title", { y: 30, opacity: 0, duration: 0.9, delay: 0.35 });
    gsap.from(".hero-sub", { y: 20, opacity: 0, duration: 0.8, delay: 0.5 });
    gsap.from(".hero-cta", { y: 20, opacity: 0, duration: 0.7, delay: 0.65 });
    gsap.from(".hero-stats", { y: 20, opacity: 0, duration: 0.7, delay: 0.8 });
    gsap.from(".hero-image-wrap", { scale: 0.97, opacity: 0, duration: 1.1, delay: 0.3 });

    // Scroll reveals
    const revealTargets = [
      ".about-text > *",
      ".about-image-wrap",
      ".counter-card",
      ".service-card",
      ".contact-form-wrap > *",
      ".contact-info-card",
    ];
    revealTargets.forEach(sel => {
      gsap.utils.toArray(sel).forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 88%" },
          y: 24, opacity: 0, duration: 0.65,
          delay: i * 0.08,
        });
      });
    });

    // Counter animation
    function animateCounters() {
      document.querySelectorAll(".count-number").forEach(el => {
        if (el.dataset.animated === "true") return;
        el.dataset.animated = "true";
        const target = Number(el.dataset.target) || 0;
        const duration = Math.min(3.5, 1.2 + target / 80);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration, ease: "power1.out",
          onUpdate() {
            el.textContent = Math.floor(obj.v).toLocaleString();
          },
          onComplete() {
            el.textContent = target.toLocaleString() + "+";
          }
        });
      });
    }

    ScrollTrigger.create({
      trigger: "#counters",
      start: "top 80%",
      once: true,
      onEnter: animateCounters,
    });

    ScrollTrigger.refresh();
  });

  // ══════════════════════════════════════
  // SUCCESS POPUP MODAL
  // ══════════════════════════════════════
  const popup         = document.getElementById("successPopup");
  const popupCard     = document.getElementById("popupCard");
  const closeBtnX     = document.getElementById("popupCloseBtn");
  const closeBtnMain  = document.getElementById("popupCloseBtnMain");
  const particlesWrap = document.getElementById("popupParticles");
  const contactForm   = document.getElementById("contactForm");
  const submitBtn     = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

  // ── Particle field ──────────────────────────────────
  const PARTICLE_COLORS = [
    "rgba(45,95,166,.7)", "rgba(107,140,186,.6)",
    "rgba(155,181,212,.5)", "rgba(255,255,255,.35)",
    "rgba(74,222,128,.5)", "rgba(56,189,248,.4)"
  ];

  function buildParticles() {
    if (!particlesWrap) return;
    particlesWrap.innerHTML = "";
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("div");
      p.className = "popup-particle";
      const size = 4 + Math.random() * 12;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 60}%;
        background:${PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]};
        --dur:${3 + Math.random() * 4}s;
        --delay:${Math.random() * 3}s;
        filter:blur(${Math.random() < .35 ? 1 : 0}px);
      `;
      particlesWrap.appendChild(p);
    }
  }

  // ── Confetti burst ──────────────────────────────────
  const CONFETTI_COLORS = [
    "#2d5fa6","#6b8cba","#9bb5d4","#4ade80",
    "#facc15","#f472b6","#38bdf8","#a78bfa","#fb923c"
  ];

  function launchConfetti() {
    const count = 100;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      const angle  = Math.random() * 360;
      const rad    = (angle * Math.PI) / 180;
      const startX = cx + Math.cos(rad) * (Math.random() * 50);
      const startY = cy + Math.sin(rad) * (Math.random() * 50);
      const size   = 6 + Math.random() * 12;
      const spin   = (-220 + Math.random() * 440) + "deg";
      const dur    = 1.5 + Math.random() * 2;
      const delay  = Math.random() * 0.55;
      const shape  = Math.random() < .4 ? "50%" : Math.random() < .5 ? "0%" : "3px";
      el.style.cssText = `
        left:${startX}px; top:${startY}px;
        width:${size}px; height:${size * (Math.random() < .5 ? 1 : .4)}px;
        background:${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
        border-radius:${shape};
        --dur:${dur}s; --delay:${delay}s; --spin:${spin};
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), (dur + delay) * 1000 + 300);
    }
  }

  // ── Open / close ────────────────────────────────────
  function openPopup() {
    if (!popup) return;
    buildParticles();
    popup.removeAttribute("aria-hidden");
    popup.classList.add("is-visible");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      setTimeout(launchConfetti, 180);
    });
  }

  function closePopup() {
    if (!popup) return;
    popup.classList.remove("is-visible");
    popup.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Both close buttons
  closeBtnX?.addEventListener("click", closePopup);
  closeBtnMain?.addEventListener("click", closePopup);

  // Backdrop click
  popup?.addEventListener("click", (e) => {
    if (!popupCard?.contains(e.target)) closePopup();
  });

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup?.classList.contains("is-visible")) closePopup();
  });

  // ── Form submit intercept ───────────────────────────
  contactForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    try {
      const formData = new FormData(contactForm);
      await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
    } catch (_) {
      // Still show popup even on network error
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Send Message &rarr;";
      }
      contactForm.reset();
      openPopup();
    }
  });
});
