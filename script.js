const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const placeholder = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const siteConfig = window.ECOCOCO_CONFIG || {};

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function setCSSVar(name, value) {
  if (!name || value === undefined || value === null || value === "") return;
  document.documentElement.style.setProperty(name, String(value));
}

function px(value, fallback, min = 0, max = 2000) {
  return `${clampNumber(value, min, max, fallback)}px`;
}

function percent(value, fallback, min = 0, max = 100) {
  return `${clampNumber(value, min, max, fallback)}%`;
}

function safeHTML(value) {
  const template = document.createElement("template");
  template.innerHTML = String(value || "");
  const allowed = new Set(["STRONG", "EM", "BR", "SPAN", "SMALL"]);
  template.content.querySelectorAll("*").forEach((node) => {
    if (!allowed.has(node.tagName)) {
      node.replaceWith(document.createTextNode(node.textContent || ""));
      return;
    }
    [...node.attributes].forEach((attr) => {
      if (attr.name !== "class") node.removeAttribute(attr.name);
    });
  });
  return template.innerHTML;
}

function applyAppearance(appearance = {}) {
  Object.entries(appearance.colors || {}).forEach(([name, value]) => setCSSVar(name, value));
  const typography = appearance.typography || {};
  setCSSVar("--body-font", typography.bodyFont);
  setCSSVar("--heading-font", typography.headingFont);
  setCSSVar("--base-font-size", typography.baseFontSize);
  setCSSVar("--heading-scale", clampNumber(typography.headingScale, 0.78, 1.28, 1));

  const headerLayout = appearance.header || {};
  setCSSVar("--header-min-height", px(headerLayout.height, 76, 54, 140));
  setCSSVar("--header-scrolled-height", px(headerLayout.scrolledHeight, 62, 48, 120));
  setCSSVar("--nav-bg-opacity", clampNumber(headerLayout.navOpacity, 0.2, 1, 0.72));
  setCSSVar("--nav-blur", px(headerLayout.navBlur, 18, 0, 36));
  setCSSVar("--logo-circle-size", px(headerLayout.logoCircleSize, 176, 72, 320));
  setCSSVar("--logo-image-scale", percent(headerLayout.logoImageScale, 52, 20, 100));
  setCSSVar("--logo-offset-y", percent(headerLayout.logoOffsetY, -16, -80, 40));

  const heroLayout = appearance.hero || {};
  setCSSVar("--hero-min-height", px(heroLayout.minHeight, 720, 420, 1100));
  setCSSVar("--hero-height", heroLayout.height || "86vh");
  setCSSVar("--hero-content-top", heroLayout.contentTop || "clamp(210px, 24vh, 250px)");

  const layout = appearance.layout || {};
  setCSSVar("--section-padding", px(layout.sectionPadding, 96, 40, 180));
  setCSSVar("--radius", px(layout.radius, 8, 0, 32));
}

function applyTexts(texts = []) {
  texts.forEach((item) => {
    if (!item?.selector) return;
    document.querySelectorAll(item.selector).forEach((element) => {
      if (item.mode === "html") {
        element.innerHTML = safeHTML(item.value);
      } else {
        element.textContent = item.value ?? "";
      }
    });
  });
}

function composeHeroBackground(src) {
  return [
    "linear-gradient(90deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.44) 54%, rgba(0, 0, 0, 0.14))",
    "linear-gradient(0deg, rgba(0, 0, 0, 0.55), transparent 48%)",
    `url("${src}") center / cover no-repeat`,
  ].join(", ");
}

function applyImages(images = []) {
  images.forEach((item) => {
    if (!item?.selector || !item.src) return;
    document.querySelectorAll(item.selector).forEach((element) => {
      if (item.kind === "background") {
        element.style.background = item.overlay === "hero" ? composeHeroBackground(item.src) : `url("${item.src}") center / cover no-repeat`;
      } else {
        element.setAttribute("src", item.src);
      }
    });
    if (item.fullSelector) {
      document.querySelectorAll(item.fullSelector).forEach((element) => element.setAttribute("data-full", item.src));
    }
  });
}

function applyLinks(links = {}) {
  const email = links.email || "ecococomada@gmail.com";
  const phone = links.phone || "+261343924689";
  const facebook = links.facebook || "https://www.facebook.com/profile.php?id=61591071884837";
  window.ecococoContactEmail = email;

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.href = `mailto:${email}`;
    if (link.textContent.includes("@")) link.textContent = email;
  });
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.href = `tel:${phone.replace(/\s+/g, "")}`;
  });
  document.querySelectorAll('a[href*="facebook.com"]').forEach((link) => {
    link.href = facebook;
  });
}

function applySiteConfig() {
  applyAppearance(siteConfig.appearance);
  applyTexts(siteConfig.texts);
  applyImages(siteConfig.images);
  applyLinks(siteConfig.links);
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  nav.classList.remove("is-open");
  header.classList.remove("is-open");
}

applySiteConfig();
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("is-open", !isOpen);
  header.classList.toggle("is-open", !isOpen);
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }
});

document.querySelectorAll("[data-full]").forEach((button) => {
  button.addEventListener("click", () => openLightbox(button));
});

function openLightbox(button) {
  const image = button.querySelector("img");
  const caption = button.querySelector("span");
  lightboxImage.src = button.dataset.full;
  lightboxImage.alt = image ? image.alt : "";
  lightboxCaption.textContent = caption ? caption.textContent : "";
  lightbox.hidden = false;
  document.body.classList.add("no-scroll");
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = placeholder;
  document.body.classList.remove("no-scroll");
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const organization = String(formData.get("organization") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const subject = `Contact depuis le site EcoCoco - ${name || "Visiteur"}`;
  const body = [
    `Nom : ${name}`,
    `Email : ${email}`,
    organization ? `Organisation : ${organization}` : null,
    "",
    "Message :",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  if (formNote) {
    formNote.textContent = "Votre messagerie va s'ouvrir avec un email prérempli pour EcoCoco.";
  }
  const emailTo = window.ecococoContactEmail || siteConfig.links?.email || "ecococomada@gmail.com";
  window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!lightbox.hidden) {
      closeLightbox();
    }
    closeMenu();
  }
});
