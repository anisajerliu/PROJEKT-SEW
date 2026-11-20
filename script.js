/* ==========================================================
   GjejShërbim - script.js
   ========================================================== */

const CONFIG = {
    CONTACT_ENDPOINT: "",
    LOGIN_ENDPOINT: "",
    REGISTER_ENDPOINT: "",
    ITEMS_PER_PAGE: 6
};

const CATEGORIES = [
    { name: "Elektricistë", desc: "Instalime dhe riparime elektrike", icon: "fa-bolt", color: "accent-orange" },
    { name: "Dentistë", desc: "Kujdes dhe trajtime dentare", icon: "fa-tooth", color: "accent-blue" },
    { name: "Sallone bukurie", desc: "Shërbime bukurie dhe kujdesi", icon: "fa-spa", color: "accent-pink" },
    { name: "Mjeshtër shtëpiak", desc: "Riparime dhe punë në shtëpi", icon: "fa-screwdriver-wrench", color: "accent-yellow" },
    { name: "Hidraulikë", desc: "Riparime dhe instalime", icon: "fa-faucet", color: "accent-blue" },
    { name: "Pastrim i shtëpive", desc: "Pastrim i shtëpive dhe lokaleve", icon: "fa-broom", color: "accent-green" },
    { name: "Mekanikë", desc: "Diagnostikim dhe riparim automjetesh", icon: "fa-car", color: "accent-purple" },
    { name: "Riparim i kompjuterëve", desc: "Riparim dhe mirëmbajtje IT", icon: "fa-laptop-code", color: "accent-blue" },
    { name: "Shërbime të ndërtimit", desc: "Ndërtim, renovim dhe punime", icon: "fa-hammer", color: "accent-yellow", short: "Ndërtim" },
    { name: "Kopshtarë", desc: "Kujdes dhe mirëmbajtje kopshtesh", icon: "fa-seedling", color: "accent-green" }
];

const SERVICES = [
    { id: 1, category: "Elektricistë", title: "Instalime dhe riparime elektrike", provider: "Arben Krasniqi", location: "Gjilan", price: 25, rating: 4.9, img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600" },
    { id: 2, category: "Pastrim i shtëpive", title: "Pastrim profesional i ambienteve", provider: "Vjollca Berisha", location: "Prishtinë", price: 30, rating: 4.8, img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600" },
    { id: 3, category: "Hidraulikë", title: "Instalime dhe riparime hidraulike", provider: "Ilir Gashi", location: "Ferizaj", price: 20, rating: 4.7, img: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600" },
    { id: 4, category: "Dentistë", title: "Kontroll dhe pastrim dentar", provider: "Dr. Elira Hoxha", location: "Prishtinë", price: 20, rating: 4.9, img: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600" },
    { id: 5, category: "Sallone bukurie", title: "Stilim dhe kujdes për flokët", provider: "Arta Beauty Studio", location: "Gjilan", price: 15, rating: 4.8, img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600" },
    { id: 6, category: "Mjeshtër shtëpiak", title: "Montim mobiliesh dhe rafte", provider: "Besnik Aliu", location: "Ferizaj", price: 18, rating: 4.7, img: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?w=600" },
    { id: 7, category: "Mekanikë", title: "Diagnostikim i automjetit", provider: "Auto Servis Luan", location: "Prizren", price: 25, rating: 4.8, img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600" },
    { id: 8, category: "Riparim i kompjuterëve", title: "Diagnostikim dhe riparim laptopi", provider: "Driton Tech", location: "Prishtinë", price: 15, rating: 4.9, img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600" },
    { id: 9, category: "Shërbime të ndërtimit", title: "Renovim dhe punime të brendshme", provider: "Ekipi Dauti", location: "Gjilan", price: 50, rating: 4.8, img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600" },
    { id: 10, category: "Kopshtarë", title: "Mirëmbajtje dhe rregullim kopshti", provider: "Liridon Kelmendi", location: "Pejë", price: 20, rating: 4.7, img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600" }
];

// Shkurtesa për përzgjedhjen e elementeve HTML.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const header = $("#header");
const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");
const toast = $("#toast");
const backToTop = $("#backToTop");
const searchForm = $("#serviceSearch");
const searchInput = $("#searchInput");
const locationInput = $("#locationInput");
const categoryGrid = $("#categoryGrid");
const filterWrap = $("#serviceFilters");
const serviceGrid = $("#serviceGrid");
const providerGrid = $("#providerGrid");
const resultsCount = $("#resultsCount");
const sortSelect = $("#sortSelect");
const emptyState = $("#emptyState");
const loadMoreBtn = $("#loadMoreBtn");

function esc(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

function normalizeText(value) {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function initials(name) {
    return name.replace(/^Dr\.\s*/i, "").split(/\s+/).slice(0, 2).map(word => word[0] || "").join("").toUpperCase();
}

let toastTimer;
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

// Ruajtje e sigurt e të preferuarave në shfletues.
const store = {
    get(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* localStorage mund të jetë i çaktivizuar */ }
    }
};

// Animacioni kur elementet shfaqen në ekran.
let revealObserver = null;
if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
}

function reveal(elements) {
    elements.forEach(element => {
        element.classList.add("reveal");
        if (revealObserver) revealObserver.observe(element);
        else element.classList.add("visible");
    });
}

// Menyja për telefona.
function setMenu(open) {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.toggle("show", open);
    menuToggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Mbyll menunë" : "Hap menunë");
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("show")));
    $$("#navLinks a").forEach(link => link.addEventListener("click", () => setMenu(false)));
}

// Gjendja aktuale e filtrave.
const state = {
    category: "all",
    query: "",
    location: "",
    sort: "newest",
    visible: CONFIG.ITEMS_PER_PAGE
};

const savedFavorites = store.get("favorites", []);
let favorites = new Set(Array.isArray(savedFavorites) ? savedFavorites.map(Number) : []);

function getFilteredServices() {
    const query = normalizeText(state.query.trim());
    const location = normalizeText(state.location.trim());

    const list = SERVICES.filter(item => {
        const matchesCategory = state.category === "all" || item.category === state.category;
        const searchableText = normalizeText(`${item.title} ${item.provider} ${item.category} ${item.location}`);
        const matchesQuery = !query || searchableText.includes(query);
        const matchesLocation = !location || normalizeText(item.location).includes(location);
        return matchesCategory && matchesQuery && matchesLocation;
    });

    switch (state.sort) {
        case "rating": list.sort((a, b) => b.rating - a.rating); break;
        case "price-asc": list.sort((a, b) => a.price - b.price); break;
        case "price-desc": list.sort((a, b) => b.price - a.price); break;
        default: list.sort((a, b) => b.id - a.id);
    }
    return list;
}

function renderCategories() {
    if (!categoryGrid) return;
    categoryGrid.innerHTML = CATEGORIES.map(category => `
        <div class="category-card" data-category="${esc(category.name)}" role="button" tabindex="0">
            <div class="category-icon ${category.color}"><i class="fa-solid ${category.icon}"></i></div>
            <h3>${esc(category.name)}</h3>
            <p>${esc(category.desc)}</p>
        </div>
    `).join("");
    reveal($$(".category-card", categoryGrid));
}

function renderFilters() {
    if (!filterWrap) return;
    const buttons = [{ name: "all", label: "Të gjitha" }]
        .concat(CATEGORIES.map(category => ({ name: category.name, label: category.short || category.name })));

    filterWrap.innerHTML = buttons.map(button => `
        <button type="button" class="filter-btn${button.name === state.category ? " active" : ""}"
            data-filter="${esc(button.name)}">${esc(button.label)}</button>
    `).join("");
}

function serviceCardHTML(item) {
    const isFavorite = favorites.has(item.id);
    return `
        <article class="service-card" data-id="${item.id}">
            <button class="favorite-btn${isFavorite ? " active" : ""}" type="button"
                aria-pressed="${isFavorite}" aria-label="${isFavorite ? "Hiq nga të ruajturit" : "Ruaj shërbimin"}">
                <i class="fa-${isFavorite ? "solid" : "regular"} fa-heart"></i>
            </button>
            <img src="${esc(item.img)}" alt="${esc(item.title)}" width="600" height="215" loading="lazy">
            <div class="service-info">
                <span class="service-category">${esc(item.category)}</span>
                <h3>${esc(item.title)}</h3>
                <p class="service-provider">nga ${esc(item.provider)}</p>
                <div class="service-location"><i class="fa-solid fa-location-dot"></i> ${esc(item.location)}</div>
                <div class="service-bottom">
                    <span><strong>${item.price}€</strong> / nga</span>
                    <span class="rating"><i class="fa-solid fa-star"></i> ${item.rating.toFixed(1)}</span>
                </div>
                <button type="button" class="contact-btn" data-contact="${item.id}">
                    <i class="fa-solid fa-paper-plane"></i> Kontakto
                </button>
            </div>
        </article>
    `;
}

function renderServices() {
    if (!serviceGrid || !emptyState || !loadMoreBtn || !resultsCount) return;
    const list = getFilteredServices();
    const shown = list.slice(0, state.visible);

    serviceGrid.innerHTML = shown.map(serviceCardHTML).join("");
    reveal($$(".service-card", serviceGrid));

    // Nëse një fotografi nuk ngarkohet, mos e lër ikonën e gabuar të fotos.
    $$(".service-card > img", serviceGrid).forEach(img => {
        img.addEventListener("error", () => img.remove(), { once: true });
    });

    emptyState.hidden = list.length > 0;
    serviceGrid.hidden = list.length === 0;
    loadMoreBtn.hidden = list.length <= state.visible;
    resultsCount.textContent = list.length
        ? `${list.length} ${list.length === 1 ? "shërbim u gjet" : "shërbime u gjetën"}`
        : "Asnjë rezultat";
}

function renderProviders() {
    if (!providerGrid) return;
    const topProviders = [...SERVICES].sort((a, b) => b.rating - a.rating).slice(0, 3);
    providerGrid.innerHTML = topProviders.map(provider => `
        <article class="provider-card">
            <span class="provider-badge"><i class="fa-solid fa-medal"></i> Top</span>
            <div class="provider-avatar" aria-hidden="true">${esc(initials(provider.provider))}</div>
            <h3>${esc(provider.provider)}</h3>
            <p>${esc(provider.category)} · ${esc(provider.location)}</p>
            <span class="rating"><i class="fa-solid fa-star"></i> ${provider.rating.toFixed(1)}</span>
            <button type="button" class="contact-btn" data-contact="${provider.id}">
                <i class="fa-solid fa-paper-plane"></i> Kontakto
            </button>
        </article>
    `).join("");
    reveal($$(".provider-card", providerGrid));
}

function applyFilters({ scroll = false } = {}) {
    state.visible = CONFIG.ITEMS_PER_PAGE;
    $$(".filter-btn", filterWrap || document).forEach(button => {
        button.classList.toggle("active", button.dataset.filter === state.category);
    });
    renderServices();
    if (scroll) $("#sherbimet")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetFilters() {
    state.category = "all";
    state.query = "";
    state.location = "";
    if (searchInput) searchInput.value = "";
    if (locationInput) locationInput.value = "";
    applyFilters();
}

// Kërkimi me tekst dhe qytet.
if (searchForm) {
    searchForm.addEventListener("submit", event => {
        event.preventDefault();
        state.query = searchInput?.value || "";
        state.location = locationInput?.value || "";
        state.category = "all";
        applyFilters({ scroll: true });
    });
}

// Filtrimi sipas butonave të kategorive.
if (filterWrap) {
    filterWrap.addEventListener("click", event => {
        const button = event.target.closest(".filter-btn");
        if (!button) return;
        state.category = button.dataset.filter;
        applyFilters();
    });
}

if (categoryGrid) {
    categoryGrid.addEventListener("click", event => {
        const card = event.target.closest(".category-card");
        if (!card) return;
        state.category = card.dataset.category;
        applyFilters({ scroll: true });
    });

    categoryGrid.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const card = event.target.closest(".category-card");
        if (!card) return;
        event.preventDefault();
        state.category = card.dataset.category;
        applyFilters({ scroll: true });
    });
}

$$('[data-quick-search]').forEach(button => {
    button.addEventListener("click", () => {
        if (searchInput) searchInput.value = button.dataset.quickSearch;
        state.query = button.dataset.quickSearch;
        state.location = locationInput?.value || "";
        state.category = "all";
        applyFilters({ scroll: true });
    });
});

$$('[data-reset-filters]').forEach(element => element.addEventListener("click", resetFilters));
$("#clearFilters")?.addEventListener("click", resetFilters);

if (sortSelect) {
    sortSelect.addEventListener("change", () => {
        state.sort = sortSelect.value;
        renderServices();
    });
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
        state.visible += CONFIG.ITEMS_PER_PAGE;
        renderServices();
    });
}

// Hap formularin e kontaktit me të dhënat e shërbimit të zgjedhur.
function contactProvider(serviceId) {
    const item = SERVICES.find(service => service.id === Number(serviceId));
    if (!item) return;
    const contactService = $("#contactService");
    const contactSub = $("#contactSub");
    if (contactService) contactService.value = `${item.title} (${item.provider}, ${item.location})`;
    if (contactSub) contactSub.textContent = `${item.title} · ${item.provider}`;
    openModal("contactModal");
}

if (providerGrid) {
    providerGrid.addEventListener("click", event => {
        const button = event.target.closest("[data-contact]");
        if (button) contactProvider(button.dataset.contact);
    });
}

// Të preferuarit dhe butoni Kontakto në kartelat e shërbimeve.
if (serviceGrid) {
    serviceGrid.addEventListener("click", event => {
        const favoriteButton = event.target.closest(".favorite-btn");
        if (favoriteButton) {
            const card = favoriteButton.closest(".service-card");
            const id = Number(card?.dataset.id);
            if (!id) return;
            const active = !favorites.has(id);
            if (active) favorites.add(id);
            else favorites.delete(id);
            store.set("favorites", [...favorites]);
            favoriteButton.classList.toggle("active", active);
            favoriteButton.setAttribute("aria-pressed", String(active));
            favoriteButton.setAttribute("aria-label", active ? "Hiq nga të ruajturit" : "Ruaj shërbimin");
            favoriteButton.innerHTML = `<i class="fa-${active ? "solid" : "regular"} fa-heart"></i>`;
            showToast(active ? "U shtua te të ruajturit" : "U hoq nga të ruajturit");
            return;
        }

        const contactButton = event.target.closest("[data-contact]");
        if (contactButton) contactProvider(contactButton.dataset.contact);
    });
}

// Menaxhimi i dritareve (modal).
let lastFocused = null;

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    $$(".modal-backdrop.open").forEach(openModalElement => openModalElement.classList.remove("open"));
    lastFocused = document.activeElement;
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    setMenu(false);
    const firstInput = $("input:not([type=hidden]), textarea, select, button", modal);
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
}

function closeModals() {
    $$(".modal-backdrop.open").forEach(modal => modal.classList.remove("open"));
    document.body.classList.remove("modal-open");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
}

document.addEventListener("click", event => {
    const opener = event.target.closest("[data-open-modal]");
    if (opener) {
        if (opener.dataset.role && $("#registerRole")) {
            $("#registerRole").value = opener.dataset.role;
        }
        if (opener.dataset.openModal === "contactModal") {
            if ($("#contactService")) $("#contactService").value = "";
            if ($("#contactSub")) $("#contactSub").textContent = "";
        }
        openModal(opener.dataset.openModal);
        return;
    }

    const switcher = event.target.closest("[data-switch-modal]");
    if (switcher) {
        openModal(switcher.dataset.switchModal);
        return;
    }

    if (event.target.closest(".modal-close") || event.target.classList.contains("modal-backdrop")) {
        closeModals();
    }
});

document.addEventListener("keydown", event => {
    const modal = $(".modal-backdrop.open");
    if (!modal) return;
    if (event.key === "Escape") {
        closeModals();
        return;
    }
    if (event.key === "Tab") {
        const focusable = $$("a[href], button:not([disabled]), input:not([type=hidden]), textarea, select", modal);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

// Validimi dhe dërgimi i formularëve.
function setupForm(formId, endpointGetter, options = {}) {
    const form = document.getElementById(formId);
    if (!form) return;
    const errorBox = $(".form-error", form);
    const submitButton = $("button[type=submit]", form);

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (errorBox) errorBox.textContent = "";

        const fields = $$("input:not([type=hidden]), textarea, select", form);
        fields.forEach(field => field.classList.remove("invalid"));
        const invalidField = fields.find(field => !field.checkValidity());
        if (invalidField) {
            invalidField.classList.add("invalid");
            if (errorBox) {
                errorBox.textContent = invalidField.validity.valueMissing
                    ? "Ju lutem plotësoni të gjitha fushat."
                    : "Kontrolloni të dhënat e futura (format ose gjatësi e pavlefshme).";
            }
            invalidField.focus();
            return;
        }

        const data = Object.fromEntries(new FormData(form).entries());
        // Fjalëkalimi nevojitet për kyçje/regjistrim; nuk hiqet nga këto dy forma.
        const endpoint = endpointGetter();
        if (!endpoint) {
            closeModals();
            form.reset();
            if (options.onDemo) options.onDemo();
            showToast(options.demoMessage || "Demo: formulari nuk është lidhur me backend.");
            return;
        }

        if (submitButton) submitButton.disabled = true;
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            closeModals();
            form.reset();
            showToast(options.success || "Veprimi u krye me sukses.");
            if (typeof options.onSuccess === "function") options.onSuccess(data);
        } catch (error) {
            if (errorBox) errorBox.textContent = "Ndodhi një gabim gjatë dërgimit. Provo përsëri.";
            console.error(`Gabim në ${formId}:`, error);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    form.addEventListener("input", event => {
        if (event.target.matches("input, textarea, select")) event.target.classList.remove("invalid");
        if (errorBox) errorBox.textContent = "";
    });
}

setupForm("contactForm", () => CONFIG.CONTACT_ENDPOINT, {
    success: "Kërkesa u dërgua me sukses",
    demoMessage: "Demo: forma ende nuk është e lidhur me backend, prandaj asgjë nuk u dërgua."
});

setupForm("loginForm", () => CONFIG.LOGIN_ENDPOINT, {
    success: "U kyçët me sukses",
    demoMessage: "Demo: kyçja do të funksionojë pasi të lidhet me backend."
});

setupForm("registerForm", () => CONFIG.REGISTER_ENDPOINT, {
    success: "Llogaria u krijua me sukses",
    demoMessage: "Demo: regjistrimi do të funksionojë pasi të lidhet me backend."
});

// Header, butoni për t'u kthyer lart dhe lidhja aktive në navigim.
const sectionElements = $$("section[id], footer[id]");
let scrollTicking = false;

function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (backToTop) backToTop.classList.toggle("show", y > 700);

    let current = sectionElements[0] ? sectionElements[0].id : "";
    sectionElements.forEach(section => {
        if (y >= section.offsetTop - 140) current = section.id;
    });
    if (window.innerHeight + y >= document.body.offsetHeight - 4) current = "kontakti";

    $$("#navLinks > a").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
    scrollTicking = false;
}

window.addEventListener("scroll", () => {
    if (!scrollTicking) {
        requestAnimationFrame(onScroll);
        scrollTicking = true;
    }
}, { passive: true });

if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// Inicializimi i faqes.
reveal($$(".step-card, .provider-content"));
renderCategories();
renderFilters();
renderServices();
renderProviders();
onScroll();
