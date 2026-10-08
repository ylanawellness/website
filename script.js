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
  nutrition: {
    title: "Nutrition & health coaching",
    description: "Build a balanced approach to eating with personalized nutrition guidance and everyday habits that fit your life. Connect with Ylana to discuss your goals and find a starting point that feels achievable."
  },
  training: {
    title: "Personal training",
    description: "Explore one-to-one training shaped around your goals, experience, and daily routine. Contact Ylana to talk about building strength, moving with confidence, and creating a consistent practice."
  },
  fitness: {
    title: "Group fitness, Zumba & Pilates",
    description: "Bring energy and connection to your movement routine with supportive group classes. Ask Ylana about current class formats, schedules, locations, and availability."
  },
  skincare: {
    title: "Clean skincare & supplements",
    description: "Explore Ylana’s curated skincare and wellness picks. Get in touch for product information, current availability, and help finding options that fit your everyday routine."
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
    document.querySelector("#dialog-book").href = `mailto:info@ylanawellness.com?subject=${encodeURIComponent(service.title)}`;
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
