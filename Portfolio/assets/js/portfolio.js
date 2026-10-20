(function () {
  "use strict";

  // Hero typed intro (static text when motion is reduced or typed.js is missing)
  const typedEl = document.querySelector(".typed");
  if (typedEl) {
    const items = typedEl.dataset.typedItems.split(",").map((s) => s.trim());
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.Typed && !reduce) {
      new Typed(".typed", { strings: items, loop: true, typeSpeed: 70, backSpeed: 35, backDelay: 1800 });
    } else {
      typedEl.textContent = items[0];
    }
  }

  // Nav is transparent over the banner, solid after scrolling past it
  const nav = document.querySelector(".site-nav");
  const banner = document.querySelector(".hero-banner");
  if (nav && banner) {
    const onNavScroll = () =>
      nav.classList.toggle("on-hero", window.scrollY < banner.offsetHeight - nav.offsetHeight);
    window.addEventListener("scroll", onNavScroll, { passive: true });
    window.addEventListener("resize", onNavScroll);
    onNavScroll();
  }

  // Mobile menu
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Dropdown groups: click/keyboard toggle (hover handled in CSS), close on outside click or Escape
  const groups = [...document.querySelectorAll(".nav-group")];
  const closeGroups = (except) =>
    groups.forEach((g) => {
      if (g === except) return;
      g.classList.remove("open");
      g.querySelector(".nav-group-btn").setAttribute("aria-expanded", "false");
    });
  groups.forEach((g) => {
    const btn = g.querySelector(".nav-group-btn");
    btn.addEventListener("click", () => {
      const open = !g.classList.contains("open");
      closeGroups(g);
      g.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
    });
    g.querySelectorAll(".nav-menu a").forEach((a) => a.addEventListener("click", () => closeGroups()));
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".nav-group")) closeGroups(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeGroups(); });

  // Side rail: one dot per section, built from the page itself
  const railSections = [
    ["intro", "Introduction", 1], ["about", "What I bring", 1], ["impact", "Impact", 0],
    ["experience", "Experience", 1],
    ["case-studies", "Case studies", 1], ["projects", "All projects", 0], ["lab-connectivity", "Lab connectivity", 0], ["gallery", "Gallery", 0],
    ["research", "Research", 1], ["teaching", "Teaching", 0],
    ["skills", "Skills", 1], ["education", "Education & certificates", 0], ["partners", "Collaborators", 0],
    ["book", "Book a meeting", 1], ["contact", "Contact", 0],
  ];
  const rail = document.querySelector(".section-rail");
  if (rail) {
    railSections.forEach(([id, label, start], i) => {
      if (!document.getElementById(id)) return;
      const a = document.createElement("a");
      a.href = "#" + id;
      if (start && i) a.className = "group-start";
      a.setAttribute("aria-label", label);
      a.innerHTML = "<span></span>";
      a.querySelector("span").textContent = label;
      rail.appendChild(a);
    });
  }

  // Highlight the menu link, its group and the rail dot for the section in view
  const navLinks = [...document.querySelectorAll(".nav-links a[href^='#'], .section-rail a")];
  const sections = [...new Set(navLinks.map((a) => a.getAttribute("href")))]
    .map((h) => document.querySelector(h))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
          );
          groups.forEach((g) => g.classList.toggle("has-active", !!g.querySelector(".nav-menu a.active")));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // Reading progress bar; rail appears once past the banner
  const bar = document.querySelector(".read-progress span");
  const heroBanner = document.querySelector(".hero-banner");
  const onProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    if (rail && heroBanner) rail.classList.toggle("show", window.scrollY > heroBanner.offsetHeight * 0.7);
  };
  window.addEventListener("scroll", onProgress, { passive: true });
  window.addEventListener("resize", onProgress);
  onProgress();

  // Project filters (with "show all" when every project is listed)
  const PREVIEW = 6;
  let showAll = false;
  let currentCat = "all";
  const filters = [...document.querySelectorAll(".filters .filter")];
  const projects = [...document.querySelectorAll(".project")];
  const countEl = document.getElementById("project-count");
  const showAllBtn = document.getElementById("show-all-projects");
  const applyFilter = (cat) => {
    currentCat = cat;
    let shown = 0;
    projects.forEach((p) => {
      const match = cat === "all" || p.dataset.cat.split(" ").includes(cat);
      const visible = match && (cat !== "all" || showAll || shown < PREVIEW);
      p.hidden = !visible;
      if (match) shown++;
    });
    filters.forEach((f) => f.setAttribute("aria-pressed", f.dataset.filter === cat));
    if (countEl) countEl.textContent = shown + (shown === 1 ? " project" : " projects");
    if (showAllBtn) {
      showAllBtn.hidden = cat !== "all" || projects.length <= PREVIEW;
      showAllBtn.querySelector("span").textContent = showAll ? "Show fewer projects" : "Show all " + projects.length + " projects";
    }
  };
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      showAll = !showAll;
      applyFilter(currentCat);
      if (!showAll) document.getElementById("projects").scrollIntoView();
    });
  }
  filters.forEach((f) => f.addEventListener("click", () => applyFilter(f.dataset.filter)));

  // Certificate tabs
  const certTabs = [...document.querySelectorAll("[data-cert-tab]")];
  certTabs.forEach((t) =>
    t.addEventListener("click", () => {
      certTabs.forEach((x) => x.setAttribute("aria-pressed", x === t));
      document.querySelectorAll("[data-cert-panel]").forEach((p) => (p.hidden = p.dataset.certPanel !== t.dataset.certTab));
    })
  );
  // Focus-area cards can pre-select a filter
  document.querySelectorAll("[data-goto-filter]").forEach((el) =>
    el.addEventListener("click", () => applyFilter(el.dataset.gotoFilter))
  );
  applyFilter("all");

  // Expand / collapse all experience details
  const expandBtn = document.getElementById("expand-all");
  if (expandBtn) {
    expandBtn.addEventListener("click", () => {
      const items = document.querySelectorAll("#experience details.more");
      const anyClosed = [...items].some((d) => !d.open);
      items.forEach((d) => (d.open = anyClosed));
      expandBtn.querySelector("span").textContent = anyClosed ? "Collapse all details" : "Expand all details";
    });
  }

  // Case studies: open all, and open a case when jumped to from the map
  const expandCases = document.getElementById("expand-cases");
  if (expandCases) {
    expandCases.addEventListener("click", () => {
      const items = document.querySelectorAll("#case-studies details.case-body");
      const anyClosed = [...items].some((d) => !d.open);
      items.forEach((d) => (d.open = anyClosed));
      expandCases.querySelector("span").textContent = anyClosed ? "Close all case studies" : "Open all case studies";
    });
  }
  const openCaseFromHash = () => {
    const target = location.hash && document.querySelector(location.hash + ".case");
    if (target) target.querySelector("details.case-body").open = true;
  };
  window.addEventListener("hashchange", openCaseFromHash);
  openCaseFromHash();

  // Book a meeting -----------------------------------------------------------
  // Paste your scheduling links here to send visitors straight to your live calendars:
  //   Google Calendar > Appointment schedule > "Open booking page" link
  //   Zoom > Scheduler > your booking page link
  const BOOKING_LINKS = { google: "", zoom: "" };
  const bookForm = document.getElementById("book-form");
  document.querySelectorAll("[data-book]").forEach((btn) => {
    const url = BOOKING_LINKS[btn.dataset.book];
    if (url) {
      btn.href = url;
      btn.target = "_blank";
      btn.rel = "noopener";
      btn.querySelector("span").textContent = "Pick a time on my calendar";
    } else if (bookForm) {
      btn.addEventListener("click", () => {
        const value = btn.dataset.book === "zoom" ? "Zoom" : "Google Meet";
        const radio = bookForm.querySelector(`input[name="platform"][value="${value}"]`);
        if (radio) radio.checked = true;
      });
    }
  });
  if (bookForm) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "your time zone";
    const dateInput = bookForm.elements.date;
    const timeInput = bookForm.elements.time;
    const tzLabel = bookForm.querySelector(".tz-label");
    const lagosOut = bookForm.querySelector(".lagos-time");
    const errorOut = bookForm.querySelector(".form-error");
    const doneOut = bookForm.querySelector(".form-done");
    const icsBtn = document.getElementById("book-ics");
    const pad = (n) => String(n).padStart(2, "0");
    const today = new Date();
    dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    if (tzLabel) tzLabel.textContent = "(" + tz + ")";
    const chosenStart = () => {
      if (!dateInput.value || !timeInput.value) return null;
      const d = new Date(`${dateInput.value}T${timeInput.value}`);
      return isNaN(d) ? null : d;
    };
    const fmt = (d, zone) =>
      new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: zone, timeZoneName: "short" }).format(d);
    const showLagos = () => {
      const d = chosenStart();
      lagosOut.textContent = d ? "That is " + fmt(d, "Africa/Lagos") + " in Abuja." : "";
    };
    dateInput.addEventListener("change", showLagos);
    timeInput.addEventListener("change", showLagos);

    const details = () => {
      const f = bookForm.elements;
      const start = chosenStart();
      const minutes = parseInt(f.duration.value, 10);
      return { platform: f.platform.value, minutes, start, end: start && new Date(start.getTime() + minutes * 60000),
        name: f.name.value.trim(), email: f.email.value.trim(), org: f.org.value.trim(), topic: f.topic.value.trim() };
    };

    bookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const m = details();
      let problem = "";
      if (!m.start) problem = "Please choose a date and time.";
      else if (m.start < new Date()) problem = "Please choose a time in the future.";
      else if (!m.name) problem = "Please add your name.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) problem = "Please add a valid email address.";
      else if (!m.topic) problem = "Please say briefly what you'd like to discuss.";
      errorOut.textContent = problem;
      errorOut.hidden = !problem;
      if (problem) return;
      const subject = `Meeting request: ${m.platform}, ${m.minutes} min, ${fmt(m.start, "Africa/Lagos")}`;
      const body = [
        "Hello Ubokobong,", "",
        `I'd like to book a ${m.minutes}-minute ${m.platform} meeting.`, "",
        `Preferred time (my time, ${tz}): ${fmt(m.start, tz)}`,
        `Abuja time: ${fmt(m.start, "Africa/Lagos")}`, "",
        `Name: ${m.name}`, `Email: ${m.email}`, m.org ? `Organisation: ${m.org}` : "", "",
        "What I'd like to discuss:", m.topic, "",
        "Sent from your portfolio booking form.",
      ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
      window.location.href = "mailto:ubokobongokon@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      doneOut.hidden = false;
      if (icsBtn) icsBtn.hidden = false;
    });

    if (icsBtn) {
      icsBtn.addEventListener("click", () => {
        const m = details();
        if (!m.start) return;
        const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
        const esc = (t) => t.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
        const ics = [
          "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//UbEffiong//Portfolio booking//EN", "BEGIN:VEVENT",
          "UID:" + Date.now() + "@ubeffiong", "DTSTAMP:" + stamp(new Date()),
          "DTSTART:" + stamp(m.start), "DTEND:" + stamp(m.end), "STATUS:TENTATIVE",
          "SUMMARY:" + esc(`${m.platform} meeting with Ubokobong Effiong (tentative)`),
          "DESCRIPTION:" + esc(`Requested via portfolio. Topic: ${m.topic}. The ${m.platform} link will follow in the confirmation email.`),
          "END:VEVENT", "END:VCALENDAR",
        ].join("\r\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
        a.download = "meeting-with-ubokobong-effiong.ics";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      });
    }
  }

  // Gallery tabs
  const galleryTabs = [...document.querySelectorAll("[data-gallery]")];
  const showGallery = (name) => {
    galleryTabs.forEach((t) => t.setAttribute("aria-pressed", t.dataset.gallery === name));
    document.querySelectorAll("[data-gallery-panel]").forEach((p) => (p.hidden = p.dataset.galleryPanel !== name));
  };
  galleryTabs.forEach((t) => t.addEventListener("click", () => showGallery(t.dataset.gallery)));
  document.querySelectorAll("[data-open-gallery]").forEach((a) =>
    a.addEventListener("click", () => showGallery(a.dataset.openGallery))
  );

  // Lightbox
  const lightbox = document.querySelector(".lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    const lbImg = lightbox.querySelector("img");
    const lbCap = lightbox.querySelector(".lightbox-cap");
    document.querySelectorAll(".shot-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const img = btn.querySelector("img");
        const cap = btn.closest("figure").querySelector("figcaption");
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = cap ? cap.textContent : "";
        lightbox.showModal();
      })
    );
    lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });
  } else {
    // No <dialog> support: open the image in a new tab instead
    document.querySelectorAll(".shot-btn").forEach((btn) =>
      btn.addEventListener("click", () => window.open(btn.querySelector("img").src, "_blank"))
    );
  }

  // Back to top
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    const onScroll = () => toTop.classList.toggle("show", window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
