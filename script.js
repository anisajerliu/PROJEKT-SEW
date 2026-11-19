
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");
const toast = document.getElementById("toast");
const modal = document.getElementById("providerModal");
const backToTop = document.getElementById("backToTop");

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("show");
    menuToggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    menuToggle.setAttribute("aria-expanded", open);
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("show");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

const serviceCards = [...document.querySelectorAll(".service-card")];
const filterButtons = [...document.querySelectorAll(".filter-btn")];
const searchForm = document.getElementById("serviceSearch");
const searchInput = document.getElementById("searchInput");
const locationInput = document.getElementById("locationInput");

function normalizeText(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function filterServices() {
    const category = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
    const query = normalizeText(searchInput.value.trim());
    const location = normalizeText(locationInput.value.trim());
    let matches = 0;

    serviceCards.forEach(card => {
        const matchesCategory = category === "all" || card.dataset.category === category;
        const text = normalizeText(card.textContent);
        const matchesQuery = !query || text.includes(query);
        const matchesLocation = !location || normalizeText(card.dataset.location).includes(location);
        const visible = matchesCategory && matchesQuery && matchesLocation;
        card.classList.toggle("hidden", !visible);
        if (visible) matches++;
    });

    document.getElementById("sherbimet").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(matches
        ? `${matches} shërbim${matches === 1 ? "" : "e"} ${matches === 1 ? "u gjet" : "u gjetën"}`
        : "Nuk u gjetën rezultate");
}

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    filterServices();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        filterServices();
    });
});

document.querySelectorAll(".popular-searches a").forEach(link => {
    link.addEventListener("click", () => {
        searchInput.value = link.textContent.trim();
        setTimeout(filterServices, 100);
    });
});

document.querySelectorAll(".category-card").forEach(card => {
    const chooseCategory = () => {
        searchInput.value = card.dataset.category;
        filterServices();
    };
    card.addEventListener("click", chooseCategory);
    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") chooseCategory();
    });
});

document.querySelectorAll(".favorite-btn").forEach(button => {
    button.addEventListener("click", event => {
        event.stopPropagation();
        const active = button.classList.toggle("active");
        button.innerHTML = active
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';
        button.setAttribute("aria-label", active ? "Hiq nga të ruajturit" : "Ruaj shërbimin");
        showToast(active ? "U shtua te të ruajturit" : "U hoq nga të ruajturit");
    });
});

const openModal = () => {
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    modal.querySelector("input").focus();
};
const closeModal = () => {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
};

document.querySelectorAll(".provider-btn, a[href='#kycu'], a[href='#regjistrohu']").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        openModal();
    });
});
modal.querySelector(".modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
});
document.getElementById("providerForm").addEventListener("submit", event => {
    event.preventDefault();
    closeModal();
    event.target.reset();
    showToast("Kërkesa u dërgua me sukses");
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
    });
}, { threshold: 0.12 });
document.querySelectorAll(".category-card, .service-card, .step-card, .provider-content").forEach(item => {
    item.classList.add("reveal");
    observer.observe(item);
});

window.addEventListener("scroll", () => {
    backToTop.classList.toggle("show", window.scrollY > 700);

    const sections = [...document.querySelectorAll("section[id], footer[id]")];
    let current = "";
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 140) current = section.id;
    });
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
});

backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
