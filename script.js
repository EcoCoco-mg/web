const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const videoList = document.querySelector("[data-video-list]");
const videoSearch = document.querySelector("[data-video-search]");
const videoPlayer = document.querySelector("[data-video-player]");
const videoFrame = document.querySelector("[data-video-frame]");
const videoCurrentTitle = document.querySelector("[data-video-current-title]");
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
  const email = String(links.email || "ecococomada@gmail.com").trim();
  const phone = links.phone || "+261 34 29 246 89";
  const facebook = links.facebook || "https://www.facebook.com/profile.php?id=61591071884837";
  const linkedin = links.linkedin || "https://www.linkedin.com/company/ecococo-mdg/";
  window.ecococoContactEmail = email;
  window.ecococoFormEndpoint = `https://formsubmit.co/ajax/${email}`;

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.href = `mailto:${email}`;
    if (link.textContent.includes("@")) link.textContent = email;
  });
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.href = `tel:${phone.replace(/\s+/g, "")}`;
    if (/\d/.test(link.textContent)) link.textContent = phone;
  });
  document.querySelectorAll('a[href*="facebook.com"]').forEach((link) => {
    link.href = facebook;
  });
  document.querySelectorAll('a[href*="linkedin.com"]').forEach((link) => {
    link.href = linkedin;
  });
  if (contactForm) {
    contactForm.action = window.ecococoFormEndpoint;
  }
}

function drivePreviewUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.includes("/preview")) return value;
  const fileMatch = value.match(/\/file\/d\/([^/]+)/);
  const idMatch = value.match(/[?&]id=([^&]+)/);
  const id = fileMatch?.[1] || idMatch?.[1] || "";
  return id ? `https://drive.google.com/file/d/${id}/preview` : value;
}

function applyVideos(videos = []) {
  if (!videoList) return;
  const visibleVideos = videos
    .map((video, index) => ({
      ...video,
      id: video.id || `video-${index}`,
      title: String(video.title || `Vidéo ${index + 1}`).trim(),
      embedUrl: drivePreviewUrl(video.embedUrl || video.url),
    }))
    .filter((video) => video.embedUrl);

  if (!visibleVideos.length) {
    if (videoPlayer) videoPlayer.hidden = true;
    const empty = document.createElement("p");
    empty.className = "video-empty";
    empty.textContent = "La vidéothèque sera bientôt disponible.";
    videoList.innerHTML = "";
    videoList.appendChild(empty);
    return;
  }

  let activeVideo = visibleVideos[0];

  function loadVideo(video) {
    activeVideo = video;
    if (videoPlayer) videoPlayer.hidden = false;
    if (videoFrame) {
      videoFrame.innerHTML = "";
      const iframe = document.createElement("iframe");
      iframe.src = video.embedUrl;
      iframe.title = video.title;
      iframe.loading = "lazy";
      iframe.allow = "autoplay; fullscreen";
      iframe.allowFullscreen = true;
      videoFrame.appendChild(iframe);
    }
    if (videoCurrentTitle) videoCurrentTitle.textContent = video.title;
    videoList.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.videoId === video.id);
    });
  }

  function renderTitles() {
    const query = String(videoSearch?.value || "").trim().toLowerCase();
    const filtered = visibleVideos.filter((video) => video.title.toLowerCase().includes(query));
    videoList.innerHTML = "";
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "video-empty";
      empty.textContent = "Aucune vidéo ne correspond à cette recherche.";
      videoList.appendChild(empty);
      return;
    }
    filtered.forEach((video) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.videoId = video.id;
      button.textContent = video.title;
      button.classList.toggle("is-active", activeVideo.id === video.id);
      button.addEventListener("click", () => loadVideo(video));
      videoList.appendChild(button);
    });
  }

  renderTitles();
  loadVideo(activeVideo);
  if (videoSearch) {
    videoSearch.addEventListener("input", renderTitles);
  }
}

function applySiteConfig() {
  applyAppearance(siteConfig.appearance);
  applyTexts(siteConfig.texts);
  applyImages(siteConfig.images);
  applyLinks(siteConfig.links);
  applyVideos(siteConfig.videos);
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

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  if (String(formData.get("_honey") || "").trim()) {
    contactForm.reset();
    return;
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const organization = String(formData.get("organization") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const subject = `Contact depuis le site EcoCoco - ${name || "Visiteur"}`;

  const payload = {
    _subject: subject,
    _template: "table",
    _captcha: "false",
    _replyto: email,
    name,
    email,
    organization,
    message,
  };

  const emailTo = window.ecococoContactEmail || siteConfig.links?.email || "ecococomada@gmail.com";
  const endpoint = contactForm.action || `https://formsubmit.co/ajax/${emailTo}`;
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || "Envoyer le message";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";
  }
  if (formNote) {
    formNote.textContent = "Envoi du message en cours...";
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const resultText = await response.text();
    let result = {};
    try {
      result = resultText ? JSON.parse(resultText) : {};
    } catch (error) {
      result = { message: resultText };
    }
    if (!response.ok || result.success === false || result.success === "false") {
      throw new Error(result.message || `Envoi impossible (${response.status})`);
    }
    contactForm.reset();
    if (formNote) {
      formNote.textContent = "Message envoyé. Merci, EcoCoco vous répondra dès que possible.";
    }
  } catch (error) {
    if (formNote) {
      const details = String(error?.message || "").trim();
      const activationHint = "Si c'est le premier essai, vérifiez aussi la boîte ecococomada@gmail.com pour confirmer FormSubmit.";
      formNote.textContent = details
        ? `Envoi non finalisé : ${details}. ${activationHint}`
        : `Envoi non finalisé. ${activationHint}`;
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!lightbox.hidden) {
      closeLightbox();
    }
    closeMenu();
  }
});
