"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const navigationLinks = [...navigation.querySelectorAll("a")];
const mobileViewport = window.matchMedia("(max-width: 800px)");

function closeMenu() {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.querySelector("i").className = "fa-solid fa-bars";
}

menuButton.hidden = false;
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.querySelector("i").className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
});

function updateMenuLayout() {
  closeMenu();
  menuButton.hidden = !mobileViewport.matches;
}
updateMenuLayout();
mobileViewport.addEventListener("change", updateMenuLayout);

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
    if (mobileViewport.matches) {
      const target = document.querySelector(link.getAttribute("href"));
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});

const sections = navigationLinks.map((link) => document.querySelector(link.getAttribute("href")));
let scrollScheduled = false;

function updateActiveNavigation() {
  const marker = window.scrollY + window.innerHeight * 0.32;
  let active = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top + window.scrollY <= marker) active = section;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
    active = sections[sections.length - 1];
  }
  for (const link of navigationLinks) {
    const selected = link.getAttribute("href") === `#${active.id}`;
    link.classList.toggle("is-active", selected);
    if (selected) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
  scrollScheduled = false;
}

window.addEventListener("scroll", () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    window.requestAnimationFrame(updateActiveNavigation);
  }
}, { passive: true });
window.addEventListener("resize", updateActiveNavigation);
window.addEventListener("load", updateActiveNavigation);
updateActiveNavigation();

const services = {
  "nutrition": {
    "title": "Nutrition coaching",
    "description": "Move beyond the cycle of dieting, second-guessing, and starting over. Learn how to build satisfying meals, understand your nutritional needs, and make choices that support your energy, weight goals, and long-term health. We’ll work with your family meals, schedule, and preferences so that eating well becomes a skill you can rely on—and model for your children."
  },
  "training": {
    "title": "1-on-1 personal training",
    "description": "Feel more capable carrying your children, climbing stairs, and moving through a demanding day. Personalized training meets you at your current fitness level and helps you build strength, improve fitness, and grow more confident in your movement. We’ll find a pace that challenges you appropriately and fits your capacity to recover, so consistency feels achievable."
  },
  "fitness": {
    "title": "Small group fitness",
    "description": "Build fitness alongside women who understand the demands of a full life. Small group sessions bring encouragement, connection, and shared momentum to your routine. Through strength-focused movement and classes such as Zumba and Pilates, you can explore ways to feel stronger, more coordinated, and more at home in your body."
  },
  "mindbody": {
    "title": "Mind-body healing",
    "description": "When you spend much of your day responding to everyone else, it can be difficult to notice what you need. Mind-body sessions offer space to explore the emotional patterns, stress, and expectations that shape how you care for yourself. Through guided reflection and grounding practices, we’ll support greater self-awareness and a deeper connection with your body, values, and spiritual well-being."
  }
};

const dialog = document.querySelector(".service-dialog");
let serviceTrigger = null;

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const service = services[link.dataset.service];
    if (!service || typeof dialog.showModal !== "function") return;
    event.preventDefault();
    serviceTrigger = link;
    document.querySelector("#dialog-title").textContent = service.title;
    document.querySelector("#dialog-description").textContent = service.description;
    document.querySelector("#dialog-book").href = `mailto:info@ylanawellness.com?subject=${encodeURIComponent("Consultation: " + service.title)}`;
    dialog.showModal();
    document.body.classList.add("modal-open");
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if (serviceTrigger) serviceTrigger.focus();
});



// Compact, continuous testimonials ticker with native touch scrolling.
(() => {
  const carousel = document.querySelector(".testimonial-carousel");
  if (!carousel) return;
  const track = carousel.querySelector(".testimonial-track");
  const slides = [...track.querySelectorAll(".testimonial-card")];
  const toggle = carousel.querySelector(".testimonial-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let playing = !reducedMotion.matches;
  let visible = false;
  let previousTime = 0;
  let frame = 0;
  let position = track.scrollLeft;
  let cycleWidth = 0;

  // A second, non-interactive copy makes the visual loop seamless.
  const copies = slides.map(slide => {
    const copy = slide.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.removeAttribute("aria-label");
    copy.inert = true;
    track.append(copy);
    return copy;
  });
  function measure() {
    cycleWidth = copies[0].offsetLeft - slides[0].offsetLeft;
    position = track.scrollLeft;
  }
  new ResizeObserver(measure).observe(track);
  measure();
  carousel.querySelector(".testimonial-controls").hidden = false;

  function shouldRun() {
    return playing && visible && !document.hidden &&
      !carousel.matches(":hover") && !carousel.contains(document.activeElement);
  }
  function tick(time) {
    if (!shouldRun()) { frame = 0; previousTime = 0; return; }
    if (previousTime && cycleWidth) {
      position += Math.min(time - previousTime, 50) * 0.022;
      if (position >= cycleWidth) position -= cycleWidth;
      track.scrollLeft = position;
    }
    previousTime = time;
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!shouldRun()) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    } else if (!frame) {
      position = track.scrollLeft;
      frame = requestAnimationFrame(tick);
    }
  }
  function updateToggle() {
    toggle.textContent = playing ? "Pause scrolling" : "Start scrolling";
  }
  function stop() {
    playing = false;
    updateToggle();
    schedule();
  }
  function step(direction) {
    stop();
    const distance = slides[1].offsetLeft - slides[0].offsetLeft;
    let target = track.scrollLeft + direction * distance;
    if (target < 0) target += cycleWidth;
    if (target >= cycleWidth) target -= cycleWidth;
    track.scrollTo({ left: target, behavior: reducedMotion.matches ? "instant" : "smooth" });
  }
  carousel.querySelector(".testimonial-prev").addEventListener("click", () => step(-1));
  carousel.querySelector(".testimonial-next").addEventListener("click", () => step(1));
  toggle.addEventListener("click", () => {
    playing = !playing;
    updateToggle();
    schedule();
  });
  track.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  track.addEventListener("pointerdown", stop);
  track.addEventListener("wheel", stop, { passive: true });
  carousel.addEventListener("mouseenter", schedule);
  carousel.addEventListener("mouseleave", schedule);
  carousel.addEventListener("focusin", schedule);
  carousel.addEventListener("focusout", () => requestAnimationFrame(schedule));
  document.addEventListener("visibilitychange", schedule);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) stop();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: 0.1 }).observe(carousel);
  updateToggle();
})();
